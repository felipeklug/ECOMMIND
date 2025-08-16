// Stock calculation and prediction functions for ECOMMIND platform

import type { Product, ProductChannel, Order, StockMovement } from '@/types/business'

export interface StockAnalysis {
  productId: string
  sku: string
  name: string
  currentStock: number
  totalStock: number // Soma de todos os canais
  averageDailySales: number
  stockCoverage: number // Dias de cobertura
  status: 'healthy' | 'low' | 'critical' | 'out_of_stock'
  channels: {
    channelId: string
    channelName: string
    stock: number
    dailySales: number
    coverage: number
  }[]
  reorderSuggestion?: {
    suggestedQuantity: number
    urgency: 'low' | 'medium' | 'high'
    reasoning: string
  }
}

export interface StockPrediction {
  productId: string
  sku: string
  name: string
  currentStock: number
  predictedStockOut: Date | null
  daysUntilStockOut: number | null
  confidence: number // 0-100%
  trend: 'increasing' | 'stable' | 'decreasing'
  seasonalFactor: number
  recommendations: string[]
}

export interface StockAlert {
  productId: string
  sku: string
  name: string
  alertType: 'low_stock' | 'stock_out' | 'overstock' | 'slow_moving'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  currentStock: number
  recommendedAction: string
  estimatedImpact: {
    lostSales?: number
    tiedCapital?: number
  }
}

/**
 * Analisa o estoque atual de todos os produtos
 */
export function analyzeStock(
  products: Product[],
  productChannels: ProductChannel[],
  recentOrders: Order[],
  channelNames: Map<string, string>,
  analysisPeriodDays: number = 30
): StockAnalysis[] {
  return products.map(product => {
    const channels = productChannels.filter(pc => pc.productId === product.id)
    const totalStock = channels.reduce((sum, channel) => sum + channel.stock, 0)

    // Calcular vendas médias diárias
    const productOrders = recentOrders.filter(order => 
      order.items.some(item => item.productId === product.id)
    )

    const totalSold = productOrders.reduce((sum, order) => {
      const productItems = order.items.filter(item => item.productId === product.id)
      return sum + productItems.reduce((itemSum, item) => itemSum + item.quantity, 0)
    }, 0)

    const averageDailySales = totalSold / analysisPeriodDays
    const stockCoverage = averageDailySales > 0 ? totalStock / averageDailySales : Infinity

    // Determinar status
    let status: StockAnalysis['status'] = 'healthy'
    if (totalStock === 0) status = 'out_of_stock'
    else if (stockCoverage < 3) status = 'critical'
    else if (stockCoverage < 7) status = 'low'

    // Analisar por canal
    const channelAnalysis = channels.map(channel => {
      const channelOrders = productOrders.filter(order => order.channelId === channel.channelId)
      const channelSold = channelOrders.reduce((sum, order) => {
        const productItems = order.items.filter(item => item.productId === product.id)
        return sum + productItems.reduce((itemSum, item) => itemSum + item.quantity, 0)
      }, 0)

      const dailySales = channelSold / analysisPeriodDays
      const coverage = dailySales > 0 ? channel.stock / dailySales : Infinity

      return {
        channelId: channel.channelId,
        channelName: channelNames.get(channel.channelId) || 'Canal Desconhecido',
        stock: channel.stock,
        dailySales,
        coverage
      }
    })

    // Sugestão de reposição
    let reorderSuggestion: StockAnalysis['reorderSuggestion']
    if (status === 'critical' || status === 'low') {
      const targetCoverage = 30 // 30 dias de cobertura
      const suggestedQuantity = Math.ceil(averageDailySales * targetCoverage - totalStock)
      
      reorderSuggestion = {
        suggestedQuantity: Math.max(suggestedQuantity, 0),
        urgency: status === 'critical' ? 'high' : 'medium',
        reasoning: `Repor para ${targetCoverage} dias de cobertura baseado na venda média de ${averageDailySales.toFixed(1)} unidades/dia`
      }
    }

    return {
      productId: product.id,
      sku: product.sku,
      name: product.name,
      currentStock: totalStock,
      totalStock,
      averageDailySales,
      stockCoverage,
      status,
      channels: channelAnalysis,
      reorderSuggestion
    }
  })
}

/**
 * Prediz quando produtos ficarão sem estoque
 */
export function predictStockOut(
  stockAnalysis: StockAnalysis[],
  historicalOrders: Order[],
  seasonalFactors?: Map<string, number>
): StockPrediction[] {
  return stockAnalysis.map(analysis => {
    if (analysis.averageDailySales <= 0) {
      return {
        productId: analysis.productId,
        sku: analysis.sku,
        name: analysis.name,
        currentStock: analysis.currentStock,
        predictedStockOut: null,
        daysUntilStockOut: null,
        confidence: 0,
        trend: 'stable',
        seasonalFactor: 1,
        recommendations: ['Produto sem vendas recentes - revisar estratégia']
      }
    }

    // Calcular tendência de vendas (últimos 7 vs 7 anteriores)
    const recentSales = calculateRecentSales(analysis.productId, historicalOrders, 7)
    const previousSales = calculateRecentSales(analysis.productId, historicalOrders, 14, 7)
    
    let trend: StockPrediction['trend'] = 'stable'
    let trendFactor = 1

    if (recentSales > previousSales * 1.1) {
      trend = 'increasing'
      trendFactor = 1.2
    } else if (recentSales < previousSales * 0.9) {
      trend = 'decreasing'
      trendFactor = 0.8
    }

    // Fator sazonal
    const seasonalFactor = seasonalFactors?.get(analysis.productId) || 1

    // Vendas ajustadas
    const adjustedDailySales = analysis.averageDailySales * trendFactor * seasonalFactor

    // Predição
    const daysUntilStockOut = adjustedDailySales > 0 ? analysis.currentStock / adjustedDailySales : null
    const predictedStockOut = daysUntilStockOut ? new Date(Date.now() + daysUntilStockOut * 24 * 60 * 60 * 1000) : null

    // Confiança baseada na consistência das vendas
    const salesVariability = calculateSalesVariability(analysis.productId, historicalOrders)
    const confidence = Math.max(0, Math.min(100, 100 - salesVariability * 10))

    // Recomendações
    const recommendations: string[] = []
    if (daysUntilStockOut && daysUntilStockOut < 7) {
      recommendations.push('Reabastecer urgentemente')
    }
    if (trend === 'increasing') {
      recommendations.push('Considerar aumentar estoque de segurança')
    }
    if (confidence < 50) {
      recommendations.push('Vendas irregulares - monitorar de perto')
    }

    return {
      productId: analysis.productId,
      sku: analysis.sku,
      name: analysis.name,
      currentStock: analysis.currentStock,
      predictedStockOut,
      daysUntilStockOut: daysUntilStockOut ? Math.round(daysUntilStockOut) : null,
      confidence: Math.round(confidence),
      trend,
      seasonalFactor,
      recommendations
    }
  })
}

/**
 * Gera alertas de estoque baseados na análise
 */
export function generateStockAlerts(
  stockAnalysis: StockAnalysis[],
  stockPredictions: StockPrediction[],
  averageOrderValue: number = 100
): StockAlert[] {
  const alerts: StockAlert[] = []

  stockAnalysis.forEach(analysis => {
    const prediction = stockPredictions.find(p => p.productId === analysis.productId)

    // Alerta de estoque baixo
    if (analysis.status === 'critical' || analysis.status === 'low') {
      const severity = analysis.status === 'critical' ? 'critical' : 'high'
      const daysLeft = Math.round(analysis.stockCoverage)
      
      alerts.push({
        productId: analysis.productId,
        sku: analysis.sku,
        name: analysis.name,
        alertType: 'low_stock',
        severity,
        message: `Estoque para apenas ${daysLeft} dias (${analysis.currentStock} unidades)`,
        currentStock: analysis.currentStock,
        recommendedAction: analysis.reorderSuggestion?.suggestedQuantity 
          ? `Repor ${analysis.reorderSuggestion.suggestedQuantity} unidades`
          : 'Reabastecer produto',
        estimatedImpact: {
          lostSales: analysis.averageDailySales * averageOrderValue * Math.max(0, 7 - daysLeft)
        }
      })
    }

    // Alerta de produto sem estoque
    if (analysis.status === 'out_of_stock') {
      alerts.push({
        productId: analysis.productId,
        sku: analysis.sku,
        name: analysis.name,
        alertType: 'stock_out',
        severity: 'critical',
        message: 'Produto sem estoque em todos os canais',
        currentStock: 0,
        recommendedAction: 'Reabastecer urgentemente',
        estimatedImpact: {
          lostSales: analysis.averageDailySales * averageOrderValue * 7 // 7 dias de vendas perdidas
        }
      })
    }

    // Alerta de produto parado (sem vendas)
    if (analysis.averageDailySales === 0 && analysis.currentStock > 0) {
      alerts.push({
        productId: analysis.productId,
        sku: analysis.sku,
        name: analysis.name,
        alertType: 'slow_moving',
        severity: 'medium',
        message: 'Produto sem vendas nos últimos 30 dias',
        currentStock: analysis.currentStock,
        recommendedAction: 'Revisar preço ou estratégia de marketing',
        estimatedImpact: {
          tiedCapital: analysis.currentStock * 50 // Estimativa de capital parado
        }
      })
    }
  })

  return alerts.sort((a, b) => {
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
    return severityOrder[b.severity] - severityOrder[a.severity]
  })
}

// Helper functions
function calculateRecentSales(productId: string, orders: Order[], days: number, offset: number = 0): number {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days - offset)
  const endDate = new Date()
  endDate.setDate(endDate.getDate() - offset)

  return orders
    .filter(order => {
      const orderDate = new Date(order.createdAt)
      return orderDate >= startDate && orderDate <= endDate
    })
    .reduce((sum, order) => {
      const productItems = order.items.filter(item => item.productId === productId)
      return sum + productItems.reduce((itemSum, item) => itemSum + item.quantity, 0)
    }, 0)
}

function calculateSalesVariability(productId: string, orders: Order[]): number {
  // Calcular vendas diárias dos últimos 30 dias
  const dailySales: number[] = []
  
  for (let i = 0; i < 30; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dayStart = new Date(date.setHours(0, 0, 0, 0))
    const dayEnd = new Date(date.setHours(23, 59, 59, 999))
    
    const daySales = orders
      .filter(order => {
        const orderDate = new Date(order.createdAt)
        return orderDate >= dayStart && orderDate <= dayEnd
      })
      .reduce((sum, order) => {
        const productItems = order.items.filter(item => item.productId === productId)
        return sum + productItems.reduce((itemSum, item) => itemSum + item.quantity, 0)
      }, 0)
    
    dailySales.push(daySales)
  }

  // Calcular coeficiente de variação
  const mean = dailySales.reduce((sum, sales) => sum + sales, 0) / dailySales.length
  if (mean === 0) return 100 // Máxima variabilidade se não há vendas

  const variance = dailySales.reduce((sum, sales) => sum + Math.pow(sales - mean, 2), 0) / dailySales.length
  const standardDeviation = Math.sqrt(variance)
  
  return (standardDeviation / mean) * 100 // Coeficiente de variação em %
}
