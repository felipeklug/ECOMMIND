/**
 * Shopee Adapter
 * Official Shopee OpenAPI v2 integration with OAuth2
 */

import { 
  ShopeeOAuthConfig, 
  ShopeeTokenResponse, 
  ShopeeShopInfo,
  ShopeeOrder, 
  ShopeeItem,
  ShopeeStockInfo,
  ShopeeOrderIncome,
  ShopeeWebhookEvent,
  ShopeeOrderListResponseSchema,
  ShopeeOrderSchema,
  ShopeeItemListResponseSchema,
  ShopeeItemSchema,
  ShopeeStockInfoSchema,
  ShopeeOrderIncomeSchema,
  ShopeeTokenResponseSchema,
  ShopeeApiErrorSchema,
  ShopeeShopInfoSchema,
  ShopeeWebhookEventSchema
} from '@/core/validation/shopee.schemas';
import { createLogger } from '@/lib/logger';
import crypto from 'crypto';

const logger = createLogger('ShopeeAdapter');

interface ShopeeApiConfig {
  baseUrl: string;
  partnerId: string;
  partnerKey: string;
  redirectUri: string;
  region: string; // BR, SG, MY, etc.
}

interface ShopeeTokens {
  accessToken: string;
  refreshToken: string;
  shopId: number;
  partnerId: number;
  expiresAt: Date;
}

interface ShopeePaginatedResponse<T> {
  items: T[];
  pagination: {
    hasNextPage: boolean;
    nextCursor?: string;
    nextOffset?: number;
    totalCount?: number;
  };
}

export class ShopeeAdapter {
  private config: ShopeeApiConfig;
  private tokens: ShopeeTokens | null = null;

  constructor(config: ShopeeApiConfig) {
    this.config = {
      baseUrl: config.baseUrl || 'https://partner.shopeemobile.com',
      partnerId: config.partnerId,
      partnerKey: config.partnerKey,
      redirectUri: config.redirectUri,
      region: config.region || 'BR',
    };
  }

  // =====================================================
  // OAUTH2 AUTHENTICATION
  // =====================================================

  /**
   * Generate OAuth2 authorization URL
   */
  getAuthorizationUrl(state?: string): string {
    const timestamp = Math.floor(Date.now() / 1000);
    const path = '/api/v2/shop/auth_partner';
    const baseString = `${this.config.partnerId}${path}${timestamp}`;
    const sign = crypto
      .createHmac('sha256', this.config.partnerKey)
      .update(baseString)
      .digest('hex');

    const params = new URLSearchParams({
      partner_id: this.config.partnerId,
      timestamp: timestamp.toString(),
      sign,
      redirect: this.config.redirectUri,
    });

    if (state) {
      params.set('state', state);
    }

    return `${this.config.baseUrl}${path}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string, shopId: number): Promise<ShopeeTokenResponse> {
    const timestamp = Math.floor(Date.now() / 1000);
    const path = '/api/v2/auth/token/get';
    const baseString = `${this.config.partnerId}${path}${timestamp}`;
    const sign = crypto
      .createHmac('sha256', this.config.partnerKey)
      .update(baseString)
      .digest('hex');

    const body = {
      code,
      shop_id: shopId,
      partner_id: parseInt(this.config.partnerId),
    };

    const response = await fetch(`${this.config.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        ...body,
        timestamp,
        sign,
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      const error = ShopeeApiErrorSchema.safeParse(data);
      if (error.success) {
        throw new Error(`Shopee OAuth error: ${error.data.message}`);
      }
      throw new Error(`Shopee OAuth error: ${response.statusText}`);
    }

    const tokens = ShopeeTokenResponseSchema.parse(data);
    
    // Store tokens internally
    this.tokens = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      shopId: tokens.shop_id,
      partnerId: tokens.partner_id,
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
    };

    logger.info('Shopee tokens exchanged successfully', { shopId: tokens.shop_id });
    return tokens;
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string, shopId: number): Promise<ShopeeTokenResponse> {
    const timestamp = Math.floor(Date.now() / 1000);
    const path = '/api/v2/auth/access_token/get';
    const baseString = `${this.config.partnerId}${path}${timestamp}`;
    const sign = crypto
      .createHmac('sha256', this.config.partnerKey)
      .update(baseString)
      .digest('hex');

    const body = {
      refresh_token: refreshToken,
      shop_id: shopId,
      partner_id: parseInt(this.config.partnerId),
    };

    const response = await fetch(`${this.config.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        ...body,
        timestamp,
        sign,
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      const error = ShopeeApiErrorSchema.safeParse(data);
      if (error.success) {
        throw new Error(`Shopee refresh error: ${error.data.message}`);
      }
      throw new Error(`Shopee refresh error: ${response.statusText}`);
    }

    const tokens = ShopeeTokenResponseSchema.parse(data);
    
    // Update stored tokens
    this.tokens = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      shopId: tokens.shop_id,
      partnerId: tokens.partner_id,
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
    };

    logger.info('Shopee tokens refreshed successfully', { shopId: tokens.shop_id });
    return tokens;
  }

  /**
   * Set tokens for API calls
   */
  setTokens(accessToken: string, refreshToken: string, shopId: number, partnerId: number, expiresAt: Date): void {
    this.tokens = {
      accessToken,
      refreshToken,
      shopId,
      partnerId,
      expiresAt,
    };
  }

  // =====================================================
  // API HELPERS
  // =====================================================

  /**
   * Make authenticated API request with retry logic
   */
  private async makeRequest<T>(
    path: string,
    options: {
      method?: string;
      body?: any;
      shopId?: number;
    } = {},
    retryCount = 0
  ): Promise<T> {
    if (!this.tokens) {
      throw new Error('No tokens available. Please authenticate first.');
    }

    // Check if token is expired
    if (this.tokens.expiresAt <= new Date()) {
      if (retryCount === 0) {
        logger.info('Token expired, refreshing...');
        await this.refreshAccessToken(this.tokens.refreshToken, this.tokens.shopId);
        return this.makeRequest<T>(path, options, retryCount + 1);
      } else {
        throw new Error('Token refresh failed');
      }
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const shopId = options.shopId || this.tokens.shopId;
    const baseString = `${this.config.partnerId}${path}${timestamp}${this.tokens.accessToken}${shopId}`;
    const sign = crypto
      .createHmac('sha256', this.config.partnerKey)
      .update(baseString)
      .digest('hex');

    const url = `${this.config.baseUrl}${path}`;
    const method = options.method || 'GET';
    
    const requestBody = {
      partner_id: parseInt(this.config.partnerId),
      timestamp,
      access_token: this.tokens.accessToken,
      shop_id: shopId,
      sign,
      ...(options.body || {}),
    };

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: method === 'GET' ? undefined : JSON.stringify(requestBody),
      });

      const data = await response.json();

      // Handle 401 Unauthorized - token might be invalid
      if (response.status === 401 && retryCount === 0) {
        logger.info('Received 401, attempting token refresh...');
        await this.refreshAccessToken(this.tokens.refreshToken, this.tokens.shopId);
        return this.makeRequest<T>(path, options, retryCount + 1);
      }

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
        logger.warn(`Rate limited, waiting ${retryAfter} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        return this.makeRequest<T>(path, options, retryCount + 1);
      }

      if (!response.ok || data.error) {
        const error = ShopeeApiErrorSchema.safeParse(data);
        if (error.success) {
          throw new Error(`Shopee API error: ${error.data.message} (${error.data.error})`);
        }
        throw new Error(`Shopee API error: ${response.statusText}`);
      }

      return data as T;
    } catch (error) {
      logger.error('Shopee API request failed', { path, error });
      throw error;
    }
  }

  // =====================================================
  // SHOP API
  // =====================================================

  /**
   * Get shop information
   */
  async getShopInfo(shopId?: number): Promise<ShopeeShopInfo> {
    const path = '/api/v2/shop/get_shop_info';
    const response = await this.makeRequest<any>(path, { shopId });
    
    return ShopeeShopInfoSchema.parse(response.response);
  }

  // =====================================================
  // ORDERS API
  // =====================================================

  /**
   * Get order list with pagination
   */
  async getOrderList(options: {
    timeRangeField?: 'create_time' | 'update_time';
    timeFrom?: number; // Unix timestamp
    timeTo?: number; // Unix timestamp
    pageSize?: number;
    cursor?: string;
    orderStatus?: string;
    responseOptionalFields?: string[];
  } = {}): Promise<ShopeePaginatedResponse<any>> {
    const path = '/api/v2/order/get_order_list';
    
    const body = {
      time_range_field: options.timeRangeField || 'create_time',
      time_from: options.timeFrom || Math.floor((Date.now() - 90 * 24 * 60 * 60 * 1000) / 1000),
      time_to: options.timeTo || Math.floor(Date.now() / 1000),
      page_size: options.pageSize || 100,
      cursor: options.cursor || '',
      order_status: options.orderStatus || '',
      response_optional_fields: options.responseOptionalFields || [],
    };

    const response = await this.makeRequest<any>(path, { method: 'POST', body });
    const parsed = ShopeeOrderListResponseSchema.parse(response);

    return {
      items: parsed.response?.order_list || [],
      pagination: {
        hasNextPage: parsed.response?.more || false,
        nextCursor: parsed.response?.next_cursor,
      },
    };
  }

  /**
   * Get order details
   */
  async getOrderDetail(orderSnList: string[], responseOptionalFields?: string[]): Promise<ShopeeOrder[]> {
    const path = '/api/v2/order/get_order_detail';
    
    const body = {
      order_sn_list: orderSnList,
      response_optional_fields: responseOptionalFields || [
        'buyer_user_id', 'buyer_username', 'estimated_shipping_fee',
        'recipient_address', 'actual_shipping_fee', 'goods_to_declare',
        'note', 'note_update_time', 'item_list', 'pay_time',
        'dropshipper', 'dropshipper_phone', 'split_up',
        'buyer_cancel_reason', 'cancel_by_shopee', 'cancel_reason_shopee',
        'actual_shipping_fee_confirmed', 'buyer_cpf_id', 'fulfillment_flag',
        'pickup_done_time', 'package_list', 'invoice_data',
        'checkout_shipping_carrier', 'reverse_shipping_fee',
        'order_chargeable_weight_gram', 'edt'
      ],
    };

    const response = await this.makeRequest<any>(path, { method: 'POST', body });
    
    if (!response.response?.order_list) {
      return [];
    }

    return response.response.order_list.map((order: any) => ShopeeOrderSchema.parse(order));
  }

  // =====================================================
  // ITEMS API
  // =====================================================

  /**
   * Get item list with pagination
   */
  async getItemList(options: {
    offset?: number;
    pageSize?: number;
    updateTimeFrom?: number;
    updateTimeTo?: number;
    itemStatus?: string[];
  } = {}): Promise<ShopeePaginatedResponse<any>> {
    const path = '/api/v2/product/get_item_list';
    
    const body = {
      offset: options.offset || 0,
      page_size: options.pageSize || 100,
      update_time_from: options.updateTimeFrom,
      update_time_to: options.updateTimeTo,
      item_status: options.itemStatus || ['NORMAL'],
    };

    const response = await this.makeRequest<any>(path, { method: 'POST', body });
    const parsed = ShopeeItemListResponseSchema.parse(response);

    return {
      items: parsed.response?.item || [],
      pagination: {
        hasNextPage: parsed.response?.has_next_page || false,
        nextOffset: parsed.response?.next_offset,
        totalCount: parsed.response?.total_count,
      },
    };
  }

  /**
   * Get item base info
   */
  async getItemBaseInfo(itemIdList: number[], needTaxInfo?: boolean, needComplaintPolicy?: boolean): Promise<ShopeeItem[]> {
    const path = '/api/v2/product/get_item_base_info';
    
    const body = {
      item_id_list: itemIdList,
      need_tax_info: needTaxInfo || false,
      need_complaint_policy: needComplaintPolicy || false,
    };

    const response = await this.makeRequest<any>(path, { method: 'POST', body });
    
    if (!response.response?.item_list) {
      return [];
    }

    return response.response.item_list.map((item: any) => ShopeeItemSchema.parse(item));
  }

  // =====================================================
  // STOCK API
  // =====================================================

  /**
   * Get stock info
   */
  async getStockInfo(itemId: number): Promise<ShopeeStockInfo> {
    const path = '/api/v2/product/get_model_list';
    
    const body = {
      item_id: itemId,
    };

    const response = await this.makeRequest<any>(path, { method: 'POST', body });
    
    return ShopeeStockInfoSchema.parse({
      item_id: itemId,
      stock_info_list: response.response?.model || [],
    });
  }

  // =====================================================
  // FEES API
  // =====================================================

  /**
   * Get order income details (fees)
   */
  async getOrderIncome(orderSnList: string[]): Promise<ShopeeOrderIncome[]> {
    const path = '/api/v2/payment/get_order_income';
    
    const body = {
      order_sn_list: orderSnList,
    };

    const response = await this.makeRequest<any>(path, { method: 'POST', body });
    
    if (!response.response?.order_income_list) {
      return [];
    }

    return response.response.order_income_list.map((income: any) => ShopeeOrderIncomeSchema.parse(income));
  }

  // =====================================================
  // WEBHOOK VALIDATION
  // =====================================================

  /**
   * Validate webhook signature
   */
  validateWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
      
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      logger.error('Webhook signature validation failed', { error });
      return false;
    }
  }

  /**
   * Validate webhook event
   */
  validateWebhookEvent(payload: any): ShopeeWebhookEvent {
    return ShopeeWebhookEventSchema.parse(payload);
  }

  // =====================================================
  // HEALTH CHECK
  // =====================================================

  /**
   * Check API health and token validity
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    message: string;
    tokenValid: boolean;
    shopId?: number;
    lastCheck: string;
  }> {
    try {
      if (!this.tokens) {
        return {
          status: 'unhealthy',
          message: 'No tokens configured',
          tokenValid: false,
          lastCheck: new Date().toISOString(),
        };
      }

      // Try to get shop info to verify token
      const shopInfo = await this.getShopInfo();

      return {
        status: 'healthy',
        message: 'Shopee API is accessible',
        tokenValid: true,
        shopId: shopInfo.shop_id,
        lastCheck: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Unknown error',
        tokenValid: false,
        lastCheck: new Date().toISOString(),
      };
    }
  }
}
