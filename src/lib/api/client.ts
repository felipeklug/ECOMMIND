// API client for ECOMMIND platform
// Centralized HTTP client with error handling and authentication

interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
  headers?: Record<string, string>
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string, 
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { method = 'GET', body, headers = {} } = options

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    }

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body)
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`
        }
      }

      const data = await response.json()
      return { data }

    } catch (error) {
      console.error('API request failed:', error)
      return {
        error: error instanceof Error ? error.message : 'Network error'
      }
    }
  }

  // Auth endpoints
  async getCurrentUser() {
    return this.request('/auth')
  }

  async logout() {
    return this.request('/auth', { method: 'POST' })
  }

  // Company endpoints
  async getCompany() {
    return this.request('/companies')
  }

  async createCompany(data: any) {
    return this.request('/companies', { method: 'POST', body: data })
  }

  async updateCompany(data: any) {
    return this.request('/companies', { method: 'PUT', body: data })
  }

  // Products endpoints
  async getProducts(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return this.request(`/products${query}`)
  }

  async createProduct(data: any) {
    return this.request('/products', { method: 'POST', body: data })
  }

  // Orders endpoints
  async getOrders(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return this.request(`/orders${query}`)
  }

  async createOrder(data: any) {
    return this.request('/orders', { method: 'POST', body: data })
  }

  // Channels endpoints
  async getChannels() {
    return this.request('/channels')
  }

  async createChannel(data: any) {
    return this.request('/channels', { method: 'POST', body: data })
  }

  async updateChannel(data: any) {
    return this.request('/channels', { method: 'PUT', body: data })
  }

  // Analytics endpoints
  async getSalesAnalytics(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return this.request(`/analytics/sales${query}`)
  }

  async getProductAnalytics(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return this.request(`/analytics/products${query}`)
  }

  // Alerts endpoints
  async getAlerts(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return this.request(`/alerts${query}`)
  }

  async createAlert(data: any) {
    return this.request('/alerts', { method: 'POST', body: data })
  }

  async updateAlert(data: any) {
    return this.request('/alerts', { method: 'PUT', body: data })
  }

  // Tasks endpoints
  async getTasks(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return this.request(`/tasks${query}`)
  }

  async createTask(data: any) {
    return this.request('/tasks', { method: 'POST', body: data })
  }

  async updateTask(data: any) {
    return this.request('/tasks', { method: 'PUT', body: data })
  }

  // Bling integration endpoints
  async getBlingAuth() {
    return this.request('/integrations/bling/auth')
  }

  async disconnectBling() {
    return this.request('/integrations/bling/auth', { method: 'POST' })
  }

  async getBlingSync() {
    return this.request('/integrations/bling/sync')
  }

  async syncBling(data: any) {
    return this.request('/integrations/bling/sync', { method: 'POST', body: data })
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Export types
export type { ApiResponse, RequestOptions }
