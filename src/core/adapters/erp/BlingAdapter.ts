/**
 * Bling ERP Adapter
 * Handles OAuth, API calls, and data mapping for Bling integration
 */

import { logger } from '@/lib/logger';
import { encryptToken, decryptToken } from '@/lib/crypto';
import type {
  BlingProduct,
  BlingOrder,
  BlingTokenResponse,
  EncryptedTokenData,
  MappedProduct,
  MappedOrder,
  MappedOrderItem,
  Page,
  RetryConfig,
  BlingAPIError,
} from '@/core/types/bling';

export class BlingAdapter {
  private readonly baseUrl = 'https://www.bling.com.br/Api/v3';
  private readonly authUrl = 'https://www.bling.com.br/Api/v3/oauth/authorize';
  private readonly tokenUrl = 'https://www.bling.com.br/Api/v3/oauth/token';
  
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  
  private readonly retryConfig: RetryConfig = {
    maxRetries: 5,
    baseDelay: 1000, // 1 second
    maxDelay: 30000, // 30 seconds
    backoffMultiplier: 2,
  };

  constructor() {
    this.clientId = process.env.BLING_CLIENT_ID!;
    this.clientSecret = process.env.BLING_CLIENT_SECRET!;
    this.redirectUri = process.env.BLING_REDIRECT_URI || 'https://ecommind.com.br/api/integrations/bling/callback';
    
    if (!this.clientId || !this.clientSecret) {
      throw new Error('Bling credentials not configured');
    }
  }

  /**
   * Generate OAuth authorization URL
   */
  getAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'read write',
      state: state || '',
    });

    return `${this.authUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCode(code: string): Promise<EncryptedTokenData> {
    try {
      const response = await fetch(this.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          redirect_uri: this.redirectUri,
          code,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Token exchange failed: ${error.error_description || error.error}`);
      }

      const tokenData: BlingTokenResponse = await response.json();
      
      // Encrypt tokens before storage
      const encryptedAccessToken = encryptToken(tokenData.access_token);
      const encryptedRefreshToken = encryptToken(tokenData.refresh_token);
      
      const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString();
      
      return {
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        expires_at: expiresAt,
        scope: tokenData.scope,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Bling token exchange failed', { error });
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(encryptedTokenData: EncryptedTokenData): Promise<EncryptedTokenData> {
    try {
      const refreshToken = decryptToken(encryptedTokenData.refresh_token);
      
      const response = await fetch(this.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Token refresh failed: ${error.error_description || error.error}`);
      }

      const tokenData: BlingTokenResponse = await response.json();
      
      // Encrypt new tokens
      const encryptedAccessToken = encryptToken(tokenData.access_token);
      const encryptedRefreshToken = encryptToken(tokenData.refresh_token);
      
      const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString();
      
      return {
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        expires_at: expiresAt,
        scope: tokenData.scope,
        created_at: encryptedTokenData.created_at,
        updated_at: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Bling token refresh failed', { error });
      throw error;
    }
  }

  /**
   * Make authenticated API request with retry logic
   */
  private async makeRequest<T>(
    endpoint: string,
    accessToken: string,
    params?: Record<string, string>
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    let lastError: Error;
    
    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 429) {
          // Rate limited - extract retry-after header
          const retryAfter = response.headers.get('retry-after');
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : this.calculateBackoffDelay(attempt);
          
          logger.warn('Bling API rate limited', { 
            attempt, 
            retryAfter: delay,
            endpoint 
          });
          
          if (attempt < this.retryConfig.maxRetries) {
            await this.sleep(delay);
            continue;
          }
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Bling API error: ${response.status} - ${errorData.error || response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < this.retryConfig.maxRetries) {
          const delay = this.calculateBackoffDelay(attempt);
          logger.warn('Bling API request failed, retrying', { 
            attempt, 
            delay, 
            error: lastError.message,
            endpoint 
          });
          await this.sleep(delay);
        }
      }
    }

    throw lastError!;
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateBackoffDelay(attempt: number): number {
    const delay = this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt);
    return Math.min(delay, this.retryConfig.maxDelay);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get products with pagination
   */
  async getProducts(
    accessToken: string,
    since?: string,
    page: number = 1,
    pageSize: number = 100
  ): Promise<Page<BlingProduct>> {
    try {
      const params: Record<string, string> = {
        pagina: page.toString(),
        limite: pageSize.toString(),
      };

      if (since) {
        params.dataInclusao = since;
      }

      const response = await this.makeRequest<{
        data: BlingProduct[];
        pagina: number;
        totalPaginas: number;
        totalItens: number;
      }>('/produtos', accessToken, params);

      return {
        data: response.data || [],
        hasMore: response.pagina < response.totalPaginas,
        page: response.pagina,
        totalPages: response.totalPaginas,
        totalItems: response.totalItens,
      };
    } catch (error) {
      logger.error('Failed to fetch Bling products', { error, since, page });
      throw error;
    }
  }

  /**
   * Get orders with pagination
   */
  async getOrders(
    accessToken: string,
    since?: string,
    page: number = 1,
    pageSize: number = 100
  ): Promise<Page<BlingOrder>> {
    try {
      const params: Record<string, string> = {
        pagina: page.toString(),
        limite: pageSize.toString(),
      };

      if (since) {
        params.dataInclusao = since;
      }

      const response = await this.makeRequest<{
        data: BlingOrder[];
        pagina: number;
        totalPaginas: number;
        totalItens: number;
      }>('/pedidos/vendas', accessToken, params);

      return {
        data: response.data || [],
        hasMore: response.pagina < response.totalPaginas,
        page: response.pagina,
        totalPages: response.totalPaginas,
        totalItems: response.totalItens,
      };
    } catch (error) {
      logger.error('Failed to fetch Bling orders', { error, since, page });
      throw error;
    }
  }

  /**
   * Map Bling product to our schema
   */
  mapProduct(blingProduct: BlingProduct, companyId: string): MappedProduct {
    return {
      company_id: companyId,
      sku: blingProduct.codigo,
      title: blingProduct.descricao,
      description: blingProduct.descricaoComplementar || blingProduct.observacoes,
      product_type: blingProduct.tipo || 'product',
      brand: blingProduct.marca,
      category: blingProduct.categoria?.descricao,
      weight_kg: blingProduct.pesoLiquido ? blingProduct.pesoLiquido / 1000 : undefined,
      dimensions: blingProduct.dimensoes ? {
        width: blingProduct.dimensoes.largura,
        height: blingProduct.dimensoes.altura,
        depth: blingProduct.dimensoes.profundidade,
      } : undefined,
      gtin: blingProduct.gtin,
      ncm: blingProduct.tributacao?.ncm,
      active: blingProduct.situacao === 'Ativo',
      external_id: blingProduct.id.toString(),
      external_data: blingProduct,
      created_dt: blingProduct.dataInclusao,
      updated_dt: blingProduct.dataAlteracao || new Date().toISOString(),
    };
  }

  /**
   * Map Bling order to our schema
   */
  mapOrder(blingOrder: BlingOrder, companyId: string): MappedOrder {
    // Determine channel based on loja or default to 'bling'
    let channel = 'bling';
    if (blingOrder.loja?.nome) {
      const lojaNome = blingOrder.loja.nome.toLowerCase();
      if (lojaNome.includes('mercado') || lojaNome.includes('livre')) {
        channel = 'meli';
      } else if (lojaNome.includes('shopee')) {
        channel = 'shopee';
      } else if (lojaNome.includes('amazon')) {
        channel = 'amazon';
      } else if (lojaNome.includes('site') || lojaNome.includes('loja')) {
        channel = 'site';
      }
    }

    // Map status
    const statusMap: Record<string, string> = {
      'Em aberto': 'pending',
      'Em andamento': 'processing',
      'Venda agendada': 'scheduled',
      'Em produção': 'processing',
      'Pronto para envio': 'ready_to_ship',
      'Enviado': 'shipped',
      'Entregue': 'delivered',
      'Cancelado': 'cancelled',
      'Devolvido': 'returned',
    };

    const status = statusMap[blingOrder.situacao.nome] || 'pending';

    // Calculate shipping cost from transport
    const shippingCost = blingOrder.transporte?.frete || 0;

    // Calculate discount
    const discount = blingOrder.desconto?.valor || 0;

    return {
      company_id: companyId,
      order_id: blingOrder.numero,
      channel,
      order_dt: blingOrder.data,
      buyer_id: blingOrder.contato.id.toString(),
      buyer_name: blingOrder.contato.nome,
      buyer_email: blingOrder.contato.email,
      buyer_phone: blingOrder.contato.telefone || blingOrder.contato.celular,
      status,
      payment_method: blingOrder.parcelas?.[0]?.formaPagamento?.nome,
      total_amount: blingOrder.total,
      shipping_cost: shippingCost,
      discount,
      external_id: blingOrder.id.toString(),
      external_data: blingOrder,
      created_dt: blingOrder.dataInclusao,
      updated_dt: blingOrder.dataAlteracao || new Date().toISOString(),
    };
  }

  /**
   * Map Bling order items to our schema
   */
  mapOrderItems(blingOrder: BlingOrder, companyId: string): MappedOrderItem[] {
    return blingOrder.itens.map((item, index) => ({
      company_id: companyId,
      order_id: blingOrder.numero,
      item_seq: index + 1,
      sku: item.codigo,
      product_title: item.descricao,
      qty: item.quantidade,
      unit_price: item.valor,
      fees_total: 0, // Bling doesn't provide marketplace fees directly
      shipping_cost: 0, // Shipping is at order level
      discount: item.desconto || 0,
      ad_cost: 0, // Not available in Bling
      external_data: item,
    }));
  }
}
