// Bling ERP API Client
// Official Bling API v3 integration for ECOMMIND platform

import { createLogger } from '@/lib/security/logger'

interface BlingConfig {
  clientId: string
  clientSecret: string
  baseUrl: string
}

interface BlingTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  scope: string
}

interface BlingApiResponse<T = any> {
  data?: T
  errors?: Array<{
    error: string
    description: string
  }>
}

export class BlingApiClient {
  private config: BlingConfig
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private tokenExpiry: Date | null = null
  private logger = createLogger({ action: 'bling_api' })

  constructor(config: BlingConfig) {
    this.config = config
  }

  // OAuth 2.0 Authentication
  async authenticate(authCode?: string): Promise<boolean> {
    try {
      const tokenData = authCode 
        ? await this.getAccessToken(authCode)
        : await this.refreshAccessToken()

      if (tokenData) {
        this.accessToken = tokenData.access_token
        this.refreshToken = tokenData.refresh_token
        this.tokenExpiry = new Date(Date.now() + (tokenData.expires_in * 1000))
        return true
      }
      return false
    } catch (error) {
      this.logger.error('Bling authentication failed', error)
      return false
    }
  }

  private async getAccessToken(authCode: string): Promise<BlingTokenResponse | null> {
    const response = await fetch(`${this.config.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code: authCode
      })
    })

    if (!response.ok) {
      throw new Error(`Token request failed: ${response.status}`)
    }

    return await response.json()
  }

  private async refreshAccessToken(): Promise<BlingTokenResponse | null> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await fetch(`${this.config.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: this.refreshToken
      })
    })

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.status}`)
    }

    return await response.json()
  }

  private async ensureValidToken(): Promise<void> {
    if (!this.accessToken || !this.tokenExpiry) {
      throw new Error('Not authenticated')
    }

    // Refresh token if it expires in the next 5 minutes
    if (this.tokenExpiry.getTime() - Date.now() < 5 * 60 * 1000) {
      await this.refreshAccessToken()
    }
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<BlingApiResponse<T>> {
    await this.ensureValidToken()

    const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      }
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(`Bling API error: ${response.status} - ${JSON.stringify(data)}`)
    }

    return data
  }

  // Products API
  async getProducts(params?: {
    pagina?: number
    limite?: number
    criterio?: string
    tipo?: string
  }): Promise<BlingApiResponse> {
    const searchParams = new URLSearchParams()
    if (params?.pagina) searchParams.set('pagina', params.pagina.toString())
    if (params?.limite) searchParams.set('limite', params.limite.toString())
    if (params?.criterio) searchParams.set('criterio', params.criterio)
    if (params?.tipo) searchParams.set('tipo', params.tipo)

    const query = searchParams.toString()
    return this.request(`/produtos${query ? `?${query}` : ''}`)
  }

  async getProduct(id: string): Promise<BlingApiResponse> {
    return this.request(`/produtos/${id}`)
  }

  async createProduct(product: any): Promise<BlingApiResponse> {
    return this.request('/produtos', {
      method: 'POST',
      body: JSON.stringify(product)
    })
  }

  async updateProduct(id: string, product: any): Promise<BlingApiResponse> {
    return this.request(`/produtos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product)
    })
  }

  // Orders API (Pedidos de Venda)
  async getOrders(params?: {
    pagina?: number
    limite?: number
    dataInicial?: string
    dataFinal?: string
    idSituacao?: number
  }): Promise<BlingApiResponse> {
    const searchParams = new URLSearchParams()
    if (params?.pagina) searchParams.set('pagina', params.pagina.toString())
    if (params?.limite) searchParams.set('limite', params.limite.toString())
    if (params?.dataInicial) searchParams.set('dataInicial', params.dataInicial)
    if (params?.dataFinal) searchParams.set('dataFinal', params.dataFinal)
    if (params?.idSituacao) searchParams.set('idSituacao', params.idSituacao.toString())

    const query = searchParams.toString()
    return this.request(`/pedidos/vendas${query ? `?${query}` : ''}`)
  }

  async getOrder(id: string): Promise<BlingApiResponse> {
    return this.request(`/pedidos/vendas/${id}`)
  }

  // Stock API (Estoques)
  async getStock(params?: {
    pagina?: number
    limite?: number
    idsProdutos?: string[]
  }): Promise<BlingApiResponse> {
    const searchParams = new URLSearchParams()
    if (params?.pagina) searchParams.set('pagina', params.pagina.toString())
    if (params?.limite) searchParams.set('limite', params.limite.toString())
    if (params?.idsProdutos) {
      params.idsProdutos.forEach(id => searchParams.append('idsProdutos[]', id))
    }

    const query = searchParams.toString()
    return this.request(`/estoques/saldos${query ? `?${query}` : ''}`)
  }

  // Financial API (Contas a Receber/Pagar)
  async getReceivables(params?: {
    pagina?: number
    limite?: number
    dataInicial?: string
    dataFinal?: string
  }): Promise<BlingApiResponse> {
    const searchParams = new URLSearchParams()
    if (params?.pagina) searchParams.set('pagina', params.pagina.toString())
    if (params?.limite) searchParams.set('limite', params.limite.toString())
    if (params?.dataInicial) searchParams.set('dataInicial', params.dataInicial)
    if (params?.dataFinal) searchParams.set('dataFinal', params.dataFinal)

    const query = searchParams.toString()
    return this.request(`/contas/receber${query ? `?${query}` : ''}`)
  }

  async getPayables(params?: {
    pagina?: number
    limite?: number
    dataInicial?: string
    dataFinal?: string
  }): Promise<BlingApiResponse> {
    const searchParams = new URLSearchParams()
    if (params?.pagina) searchParams.set('pagina', params.pagina.toString())
    if (params?.limite) searchParams.set('limite', params.limite.toString())
    if (params?.dataInicial) searchParams.set('dataInicial', params.dataInicial)
    if (params?.dataFinal) searchParams.set('dataFinal', params.dataFinal)

    const query = searchParams.toString()
    return this.request(`/contas/pagar${query ? `?${query}` : ''}`)
  }

  // Categories API
  async getCategories(): Promise<BlingApiResponse> {
    return this.request('/categorias/produtos')
  }

  // Contacts API (Contatos/Clientes)
  async getContacts(params?: {
    pagina?: number
    limite?: number
    tipo?: string
  }): Promise<BlingApiResponse> {
    const searchParams = new URLSearchParams()
    if (params?.pagina) searchParams.set('pagina', params.pagina.toString())
    if (params?.limite) searchParams.set('limite', params.limite.toString())
    if (params?.tipo) searchParams.set('tipo', params.tipo)

    const query = searchParams.toString()
    return this.request(`/contatos${query ? `?${query}` : ''}`)
  }
}

// Factory function to create Bling client
export function createBlingClient(): BlingApiClient {
  const config: BlingConfig = {
    clientId: process.env.BLING_CLIENT_ID || '',
    clientSecret: process.env.BLING_CLIENT_SECRET || '',
    baseUrl: process.env.BLING_API_URL || 'https://api.bling.com.br/v3'
  }

  if (!config.clientId || !config.clientSecret) {
    throw new Error('Bling API credentials not configured')
  }

  return new BlingApiClient(config)
}
