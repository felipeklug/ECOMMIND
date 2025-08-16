/**
 * Mercado Livre Adapter
 * Official Meli API integration with OAuth2
 */

import { 
  MeliOAuthConfig, 
  MeliTokenResponse, 
  MeliUser,
  MeliOrder, 
  MeliListing,
  MeliFeesResponse,
  MeliWebhookNotification,
  MeliOrderSearchResponseSchema,
  MeliOrderSchema,
  MeliListingSchema,
  MeliFeesResponseSchema,
  MeliTokenResponseSchema,
  MeliApiErrorSchema,
  MeliUserSchema
} from '@/core/validation/meli.schemas';
import { createLogger } from '@/lib/logger';

const logger = createLogger('MeliAdapter');

interface MeliApiConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  siteId: string; // MLB, MLA, etc.
}

interface MeliTokens {
  accessToken: string;
  refreshToken: string;
  userId: number;
  expiresAt: Date;
}

interface MeliPaginatedResponse<T> {
  items: T[];
  pagination: {
    total: number;
    offset: number;
    limit: number;
    hasNextPage: boolean;
  };
}

export class MeliAdapter {
  private config: MeliApiConfig;
  private tokens: MeliTokens | null = null;

  constructor(config: MeliApiConfig) {
    this.config = {
      baseUrl: config.baseUrl || 'https://api.mercadolibre.com',
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      redirectUri: config.redirectUri,
      siteId: config.siteId || 'MLB',
    };
  }

  // =====================================================
  // OAUTH2 AUTHENTICATION
  // =====================================================

  /**
   * Generate OAuth2 authorization URL
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      state: state || '',
    });

    return `https://auth.mercadolibre.com.br/authorization?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<MeliTokenResponse> {
    const response = await fetch(`${this.config.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri,
        code,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const error = MeliApiErrorSchema.safeParse(data);
      if (error.success) {
        throw new Error(`Meli OAuth error: ${error.data.message}`);
      }
      throw new Error(`Meli OAuth error: ${response.statusText}`);
    }

    const tokens = MeliTokenResponseSchema.parse(data);
    
    // Store tokens internally
    this.tokens = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      userId: tokens.user_id,
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
    };

    logger.info('Meli tokens exchanged successfully', { userId: tokens.user_id });
    return tokens;
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<MeliTokenResponse> {
    const response = await fetch(`${this.config.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: refreshToken,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const error = MeliApiErrorSchema.safeParse(data);
      if (error.success) {
        throw new Error(`Meli refresh error: ${error.data.message}`);
      }
      throw new Error(`Meli refresh error: ${response.statusText}`);
    }

    const tokens = MeliTokenResponseSchema.parse(data);
    
    // Update stored tokens
    this.tokens = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      userId: tokens.user_id,
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
    };

    logger.info('Meli tokens refreshed successfully', { userId: tokens.user_id });
    return tokens;
  }

  /**
   * Set tokens for API calls
   */
  setTokens(accessToken: string, refreshToken: string, userId: number, expiresAt: Date): void {
    this.tokens = {
      accessToken,
      refreshToken,
      userId,
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
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    if (!this.tokens) {
      throw new Error('No tokens available. Please authenticate first.');
    }

    // Check if token is expired
    if (this.tokens.expiresAt <= new Date()) {
      if (retryCount === 0) {
        logger.info('Token expired, refreshing...');
        await this.refreshAccessToken(this.tokens.refreshToken);
        return this.makeRequest<T>(endpoint, options, retryCount + 1);
      } else {
        throw new Error('Token refresh failed');
      }
    }

    const url = `${this.config.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.tokens.accessToken}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      // Handle 401 Unauthorized - token might be invalid
      if (response.status === 401 && retryCount === 0) {
        logger.info('Received 401, attempting token refresh...');
        await this.refreshAccessToken(this.tokens.refreshToken);
        return this.makeRequest<T>(endpoint, options, retryCount + 1);
      }

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
        logger.warn(`Rate limited, waiting ${retryAfter} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        return this.makeRequest<T>(endpoint, options, retryCount + 1);
      }

      if (!response.ok) {
        const error = MeliApiErrorSchema.safeParse(data);
        if (error.success) {
          throw new Error(`Meli API error: ${error.data.message} (${error.data.status})`);
        }
        throw new Error(`Meli API error: ${response.statusText}`);
      }

      return data as T;
    } catch (error) {
      logger.error('Meli API request failed', { endpoint, error });
      throw error;
    }
  }

  /**
   * Build query parameters for API requests
   */
  private buildQueryParams(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, String(v)));
        } else {
          searchParams.set(key, String(value));
        }
      }
    });

    return searchParams.toString();
  }

  // =====================================================
  // USER API
  // =====================================================

  /**
   * Get user information
   */
  async getUser(userId?: number): Promise<MeliUser> {
    const targetUserId = userId || this.tokens?.userId;
    if (!targetUserId) {
      throw new Error('User ID not available');
    }

    const endpoint = `/users/${targetUserId}`;
    const response = await this.makeRequest<any>(endpoint);
    
    return MeliUserSchema.parse(response);
  }

  // =====================================================
  // ORDERS API
  // =====================================================

  /**
   * Search orders with pagination
   */
  async searchOrders(options: {
    sellerId?: number;
    offset?: number;
    limit?: number;
    filters?: {
      'order.status'?: string;
      'order.date_created.from'?: string;
      'order.date_created.to'?: string;
      'shipping.status'?: string;
    };
  } = {}): Promise<MeliPaginatedResponse<number>> {
    const sellerId = options.sellerId || this.tokens?.userId;
    if (!sellerId) {
      throw new Error('Seller ID not available');
    }

    const params = this.buildQueryParams({
      seller: sellerId,
      offset: options.offset || 0,
      limit: options.limit || 50,
      ...options.filters,
    });

    const endpoint = `/orders/search?${params}`;
    const response = await this.makeRequest<any>(endpoint);
    
    const parsed = MeliOrderSearchResponseSchema.parse(response);

    return {
      items: parsed.results,
      pagination: {
        total: parsed.paging.total,
        offset: parsed.paging.offset,
        limit: parsed.paging.limit,
        hasNextPage: parsed.paging.offset + parsed.paging.limit < parsed.paging.total,
      },
    };
  }

  /**
   * Get order details by ID
   */
  async getOrder(orderId: number): Promise<MeliOrder> {
    const endpoint = `/orders/${orderId}`;
    const response = await this.makeRequest<any>(endpoint);
    
    return MeliOrderSchema.parse(response);
  }

  /**
   * Get multiple orders by IDs
   */
  async getOrders(orderIds: number[]): Promise<MeliOrder[]> {
    if (orderIds.length === 0) return [];
    
    const params = this.buildQueryParams({
      ids: orderIds.join(','),
    });

    const endpoint = `/orders?${params}`;
    const response = await this.makeRequest<MeliOrder[]>(endpoint);
    
    return response.map(order => MeliOrderSchema.parse(order));
  }

  // =====================================================
  // LISTINGS API
  // =====================================================

  /**
   * Get user's items (listings)
   */
  async getUserItems(options: {
    userId?: number;
    offset?: number;
    limit?: number;
    filters?: {
      status?: string;
      category_id?: string;
      listing_type_id?: string;
    };
  } = {}): Promise<MeliPaginatedResponse<string>> {
    const userId = options.userId || this.tokens?.userId;
    if (!userId) {
      throw new Error('User ID not available');
    }

    const params = this.buildQueryParams({
      offset: options.offset || 0,
      limit: options.limit || 50,
      ...options.filters,
    });

    const endpoint = `/users/${userId}/items/search?${params}`;
    const response = await this.makeRequest<any>(endpoint);
    
    return {
      items: response.results || [],
      pagination: {
        total: response.paging?.total || 0,
        offset: response.paging?.offset || 0,
        limit: response.paging?.limit || 50,
        hasNextPage: (response.paging?.offset || 0) + (response.paging?.limit || 50) < (response.paging?.total || 0),
      },
    };
  }

  /**
   * Get item details by ID
   */
  async getItem(itemId: string): Promise<MeliListing> {
    const endpoint = `/items/${itemId}`;
    const response = await this.makeRequest<any>(endpoint);
    
    return MeliListingSchema.parse(response);
  }

  /**
   * Get multiple items by IDs
   */
  async getItems(itemIds: string[]): Promise<MeliListing[]> {
    if (itemIds.length === 0) return [];
    
    const params = this.buildQueryParams({
      ids: itemIds.join(','),
    });

    const endpoint = `/items?${params}`;
    const response = await this.makeRequest<MeliListing[]>(endpoint);
    
    return response.map(item => MeliListingSchema.parse(item));
  }

  // =====================================================
  // INVENTORY API
  // =====================================================

  /**
   * Get available quantity for an item
   */
  async getItemInventory(itemId: string): Promise<{
    itemId: string;
    availableQuantity: number;
    soldQuantity: number;
  }> {
    const endpoint = `/items/${itemId}`;
    const response = await this.makeRequest<any>(endpoint);
    
    const item = MeliListingSchema.parse(response);
    
    return {
      itemId: item.id,
      availableQuantity: item.available_quantity,
      soldQuantity: item.sold_quantity,
    };
  }

  // =====================================================
  // FEES API
  // =====================================================

  /**
   * Get fees for an item
   */
  async getItemFees(itemId: string): Promise<MeliFeesResponse> {
    const endpoint = `/items/${itemId}/fees`;
    const response = await this.makeRequest<any>(endpoint);
    
    return MeliFeesResponseSchema.parse(response);
  }

  // =====================================================
  // WEBHOOK VALIDATION
  // =====================================================

  /**
   * Validate webhook notification
   */
  validateWebhookNotification(payload: any): MeliWebhookNotification {
    return MeliWebhookNotification.parse(payload);
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
    userId?: number;
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

      // Try to get user info to verify token
      const user = await this.getUser();

      return {
        status: 'healthy',
        message: 'Meli API is accessible',
        tokenValid: true,
        userId: user.id,
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
