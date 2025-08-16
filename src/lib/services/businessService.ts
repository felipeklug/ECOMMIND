// Business service layer for ECOMMIND platform
// This service provides business logic with mock data, ready to be replaced with real APIs

import type { 
  Product, 
  Order, 
  Channel, 
  Alert, 
  Task,
  SalesMetrics,
  ProductMetrics,
  ChannelMetrics
} from '@/types/business'

import { 
  calculateOrderMargin, 
  calculateMarginByProduct, 
  calculateMarginByChannel,
  findLowMarginProducts,
  calculatePriceSuggestion,
  type MarginCalculation,
  type MarginByProduct,
  type MarginByChannel
} from '@/lib/calculations/margin'

import {
  analyzeStock,
  predictStockOut,
  generateStockAlerts,
  type StockAnalysis,
  type StockPrediction,
  type StockAlert
} from '@/lib/calculations/stock'

import {
  mockCompany,
  mockUsers,
  mockChannels,
  mockProducts,
  mockProductChannels,
  mockOrders,
  mockAlerts,
  mockTasks,
  mockGoals,
  generateHistoricalOrders
} from './mockData'

export class BusinessService {
  private static instance: BusinessService
  private historicalOrders: Order[]
  private channelNames: Map<string, string>

  constructor() {
    // Gerar dados históricos para cálculos mais precisos
    this.historicalOrders = generateHistoricalOrders(30)
    this.channelNames = new Map(mockChannels.map(c => [c.id, c.name]))
  }

  static getInstance(): BusinessService {
    if (!BusinessService.instance) {
      BusinessService.instance = new BusinessService()
    }
    return BusinessService.instance
  }

  // ===== SALES METRICS =====
  
  async getSalesMetrics(period: 'today' | 'week' | 'month' = 'today'): Promise<SalesMetrics> {
    const now = new Date()
    let startDate: Date
    let endDate = new Date(now)

    switch (period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0))
        endDate = new Date(now.setHours(23, 59, 59, 999))
        break
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7))
        break
      case 'month':
        startDate = new Date(now.setDate(now.getDate() - 30))
        break
    }

    const periodOrders = this.historicalOrders.filter(order => {
      const orderDate = new Date(order.createdAt)
      return orderDate >= startDate && orderDate <= endDate && order.status !== 'cancelled'
    })

    const totalSales = periodOrders.reduce((sum, order) => sum + order.totalValue, 0)
    const totalOrders = periodOrders.length
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0

    // Calcular margem total
    let totalMargin = 0
    periodOrders.forEach(order => {
      const channel = mockChannels.find(c => c.id === order.channelId)
      if (channel) {
        const margin = calculateOrderMargin(order, channel, mockProducts)
        totalMargin += margin.netMargin
      }
    })

    const marginPercentage = totalSales > 0 ? (totalMargin / totalSales) * 100 : 0

    return {
      totalSales,
      totalOrders,
      averageOrderValue,
      totalMargin,
      marginPercentage,
      period: { start: startDate, end: endDate }
    }
  }

  async getChannelMetrics(): Promise<ChannelMetrics[]> {
    const marginByChannel = calculateMarginByChannel(this.historicalOrders, mockChannels, mockProducts)
    const totalSales = marginByChannel.reduce((sum, channel) => sum + channel.totalRevenue, 0)

    return marginByChannel.map(channel => ({
      channelId: channel.channelId,
      channelName: channel.channelName,
      totalSales: channel.totalRevenue,
      totalOrders: channel.orderCount,
      averageOrderValue: channel.averageOrderValue,
      totalMargin: channel.margin,
      marginPercentage: channel.marginPercentage,
      marketShare: totalSales > 0 ? (channel.totalRevenue / totalSales) * 100 : 0,
      topProducts: this.getTopProductsByChannel(channel.channelId)
    }))
  }

  async getProductMetrics(): Promise<ProductMetrics[]> {
    const marginByProduct = calculateMarginByProduct(this.historicalOrders, mockChannels, mockProducts)
    const stockAnalysis = analyzeStock(
      mockProducts, 
      mockProductChannels, 
      this.historicalOrders, 
      this.channelNames
    )

    return marginByProduct.map(product => {
      const stock = stockAnalysis.find(s => s.productId === product.productId)
      const productChannels = mockProductChannels.filter(pc => pc.productId === product.productId)

      return {
        productId: product.productId,
        sku: product.sku,
        name: product.name,
        totalSales: product.totalRevenue,
        totalOrders: this.getOrderCountByProduct(product.productId),
        currentStock: stock?.totalStock || 0,
        stockCoverage: stock?.stockCoverage || 0,
        averageMargin: product.margin,
        marginPercentage: product.marginPercentage,
        channels: productChannels.map(pc => {
          const channel = mockChannels.find(c => c.id === pc.channelId)
          const channelOrders = this.getOrdersByProductAndChannel(product.productId, pc.channelId)
          const channelSales = channelOrders.reduce((sum, order) => {
            const items = order.items.filter(item => item.productId === product.productId)
            return sum + items.reduce((itemSum, item) => itemSum + item.totalPrice, 0)
          }, 0)

          return {
            channelId: pc.channelId,
            channelName: channel?.name || 'Canal Desconhecido',
            sales: channelSales,
            orders: channelOrders.length,
            stock: pc.stock,
            price: pc.price
          }
        })
      }
    })
  }

  // ===== STOCK ANALYSIS =====

  async getStockAnalysis(): Promise<StockAnalysis[]> {
    return analyzeStock(mockProducts, mockProductChannels, this.historicalOrders, this.channelNames)
  }

  async getStockPredictions(): Promise<StockPrediction[]> {
    const stockAnalysis = await this.getStockAnalysis()
    return predictStockOut(stockAnalysis, this.historicalOrders)
  }

  async getStockAlerts(): Promise<StockAlert[]> {
    const stockAnalysis = await this.getStockAnalysis()
    const stockPredictions = await this.getStockPredictions()
    return generateStockAlerts(stockAnalysis, stockPredictions)
  }

  // ===== MARGIN ANALYSIS =====

  async getLowMarginProducts(threshold: number = 20): Promise<MarginByProduct[]> {
    const marginByProduct = calculateMarginByProduct(this.historicalOrders, mockChannels, mockProducts)
    return findLowMarginProducts(marginByProduct, threshold)
  }

  async getPriceSuggestions(productId: string, channelId: string, targetMargin: number = 25) {
    const product = mockProducts.find(p => p.id === productId)
    const channel = mockChannels.find(c => c.id === channelId)
    
    if (!product || !channel) {
      throw new Error('Produto ou canal não encontrado')
    }

    return calculatePriceSuggestion(product.costPrice, channel, targetMargin)
  }

  // ===== ALERTS & TASKS =====

  async getAlerts(unreadOnly: boolean = false): Promise<Alert[]> {
    let alerts = [...mockAlerts]
    
    // Adicionar alertas de estoque
    const stockAlerts = await this.getStockAlerts()
    const convertedStockAlerts: Alert[] = stockAlerts.map(alert => ({
      id: `stock_${alert.productId}`,
      companyId: 'comp_1',
      type: alert.alertType === 'low_stock' ? 'stock_low' : 'stock_low',
      priority: alert.severity,
      title: `${alert.alertType === 'low_stock' ? 'Estoque Baixo' : 'Sem Estoque'} - ${alert.name}`,
      message: alert.message,
      data: {
        productId: alert.productId,
        sku: alert.sku,
        currentStock: alert.currentStock,
        recommendedAction: alert.recommendedAction
      },
      isRead: false,
      isResolved: false,
      createdAt: new Date()
    }))

    alerts = [...alerts, ...convertedStockAlerts]

    if (unreadOnly) {
      alerts = alerts.filter(alert => !alert.isRead)
    }

    return alerts.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  async getTasks(status?: Task['status']): Promise<Task[]> {
    let tasks = [...mockTasks]
    
    if (status) {
      tasks = tasks.filter(task => task.status === status)
    }

    return tasks.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  // ===== HELPER METHODS =====

  private getTopProductsByChannel(channelId: string, limit: number = 5) {
    const channelOrders = this.historicalOrders.filter(order => order.channelId === channelId)
    const productSales = new Map<string, { sales: number, orders: number, name: string, sku: string }>()

    channelOrders.forEach(order => {
      order.items.forEach(item => {
        const existing = productSales.get(item.productId) || {
          sales: 0,
          orders: 0,
          name: item.productName,
          sku: item.sku
        }
        existing.sales += item.totalPrice
        existing.orders += 1
        productSales.set(item.productId, existing)
      })
    })

    return Array.from(productSales.entries())
      .map(([productId, data]) => ({
        productId,
        sku: data.sku,
        name: data.name,
        sales: data.sales,
        orders: data.orders
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, limit)
  }

  private getOrderCountByProduct(productId: string): number {
    return this.historicalOrders.filter(order =>
      order.items.some(item => item.productId === productId)
    ).length
  }

  private getOrdersByProductAndChannel(productId: string, channelId: string): Order[] {
    return this.historicalOrders.filter(order =>
      order.channelId === channelId &&
      order.items.some(item => item.productId === productId)
    )
  }

  // ===== MOCK API METHODS (to be replaced with real APIs) =====

  async getProducts(): Promise<Product[]> {
    return mockProducts
  }

  async getChannels(): Promise<Channel[]> {
    return mockChannels
  }

  async getOrders(limit?: number): Promise<Order[]> {
    const orders = [...this.historicalOrders].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    return limit ? orders.slice(0, limit) : orders
  }
}
