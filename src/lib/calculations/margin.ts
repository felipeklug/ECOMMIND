// Margin calculation functions for ECOMMIND platform

import type { Order, OrderItem, Channel, Product } from '@/types/business'

export interface MarginCalculation {
  grossRevenue: number
  netRevenue: number
  totalCosts: number
  grossMargin: number
  netMargin: number
  marginPercentage: number
  breakdown: {
    productCosts: number
    channelFees: number
    shippingCosts: number
    discounts: number
    taxes: number
  }
}

export interface MarginByProduct {
  productId: string
  sku: string
  name: string
  totalRevenue: number
  totalCosts: number
  margin: number
  marginPercentage: number
  unitsSold: number
  averageSellingPrice: number
  averageCostPrice: number
}

export interface MarginByChannel {
  channelId: string
  channelName: string
  totalRevenue: number
  totalCosts: number
  margin: number
  marginPercentage: number
  orderCount: number
  averageOrderValue: number
}

/**
 * Calcula a margem líquida de um pedido específico
 */
export function calculateOrderMargin(
  order: Order,
  channel: Channel,
  products: Product[]
): MarginCalculation {
  const grossRevenue = order.totalValue
  const shippingCosts = order.shippingCost
  const discounts = order.discountValue

  // Calcular custos dos produtos
  const productCosts = order.items.reduce((total, item) => {
    return total + (item.costPrice * item.quantity)
  }, 0)

  // Calcular taxas do canal
  const channelFees = calculateChannelFees(order, channel)

  // Calcular impostos (simplificado - 6.73% para Simples Nacional)
  const taxes = grossRevenue * 0.0673

  const totalCosts = productCosts + channelFees + shippingCosts + discounts + taxes
  const netRevenue = grossRevenue - discounts
  const grossMargin = grossRevenue - productCosts
  const netMargin = netRevenue - totalCosts

  return {
    grossRevenue,
    netRevenue,
    totalCosts,
    grossMargin,
    netMargin,
    marginPercentage: netRevenue > 0 ? (netMargin / netRevenue) * 100 : 0,
    breakdown: {
      productCosts,
      channelFees,
      shippingCosts,
      discounts,
      taxes
    }
  }
}

/**
 * Calcula as taxas específicas do canal
 */
export function calculateChannelFees(order: Order, channel: Channel): number {
  const { commission, fixedFee, shippingFee = 0 } = channel.fees
  
  // Taxa de comissão sobre o valor do pedido
  const commissionFee = order.totalValue * (commission / 100)
  
  // Taxa fixa por pedido
  const totalFixedFee = fixedFee
  
  // Taxa de frete (se aplicável)
  const totalShippingFee = shippingFee

  return commissionFee + totalFixedFee + totalShippingFee
}

/**
 * Calcula margem agregada por produto
 */
export function calculateMarginByProduct(
  orders: Order[],
  channels: Channel[],
  products: Product[]
): MarginByProduct[] {
  const productMap = new Map<string, MarginByProduct>()

  orders.forEach(order => {
    const channel = channels.find(c => c.id === order.channelId)
    if (!channel) return

    order.items.forEach(item => {
      const product = products.find(p => p.id === item.productId)
      if (!product) return

      const existing = productMap.get(item.productId) || {
        productId: item.productId,
        sku: item.sku,
        name: item.productName,
        totalRevenue: 0,
        totalCosts: 0,
        margin: 0,
        marginPercentage: 0,
        unitsSold: 0,
        averageSellingPrice: 0,
        averageCostPrice: 0
      }

      // Calcular proporção deste item no pedido total
      const itemProportion = item.totalPrice / order.totalValue
      
      // Alocar custos proporcionalmente
      const orderMargin = calculateOrderMargin(order, channel, products)
      const allocatedCosts = orderMargin.totalCosts * itemProportion

      existing.totalRevenue += item.totalPrice
      existing.totalCosts += allocatedCosts
      existing.unitsSold += item.quantity

      productMap.set(item.productId, existing)
    })
  })

  // Calcular médias e percentuais
  return Array.from(productMap.values()).map(product => {
    const margin = product.totalRevenue - product.totalCosts
    const marginPercentage = product.totalRevenue > 0 ? (margin / product.totalRevenue) * 100 : 0
    const averageSellingPrice = product.unitsSold > 0 ? product.totalRevenue / product.unitsSold : 0
    const averageCostPrice = product.unitsSold > 0 ? product.totalCosts / product.unitsSold : 0

    return {
      ...product,
      margin,
      marginPercentage,
      averageSellingPrice,
      averageCostPrice
    }
  })
}

/**
 * Calcula margem agregada por canal
 */
export function calculateMarginByChannel(
  orders: Order[],
  channels: Channel[],
  products: Product[]
): MarginByChannel[] {
  const channelMap = new Map<string, MarginByChannel>()

  orders.forEach(order => {
    const channel = channels.find(c => c.id === order.channelId)
    if (!channel) return

    const existing = channelMap.get(order.channelId) || {
      channelId: order.channelId,
      channelName: channel.name,
      totalRevenue: 0,
      totalCosts: 0,
      margin: 0,
      marginPercentage: 0,
      orderCount: 0,
      averageOrderValue: 0
    }

    const orderMargin = calculateOrderMargin(order, channel, products)

    existing.totalRevenue += orderMargin.grossRevenue
    existing.totalCosts += orderMargin.totalCosts
    existing.orderCount += 1

    channelMap.set(order.channelId, existing)
  })

  // Calcular médias e percentuais
  return Array.from(channelMap.values()).map(channel => {
    const margin = channel.totalRevenue - channel.totalCosts
    const marginPercentage = channel.totalRevenue > 0 ? (margin / channel.totalRevenue) * 100 : 0
    const averageOrderValue = channel.orderCount > 0 ? channel.totalRevenue / channel.orderCount : 0

    return {
      ...channel,
      margin,
      marginPercentage,
      averageOrderValue
    }
  })
}

/**
 * Identifica produtos com margem abaixo da meta
 */
export function findLowMarginProducts(
  marginByProduct: MarginByProduct[],
  minimumMarginPercentage: number = 20
): MarginByProduct[] {
  return marginByProduct.filter(product => 
    product.marginPercentage < minimumMarginPercentage
  ).sort((a, b) => a.marginPercentage - b.marginPercentage)
}

/**
 * Calcula sugestão de preço para atingir margem desejada
 */
export function calculatePriceSuggestion(
  costPrice: number,
  channel: Channel,
  targetMarginPercentage: number = 25,
  estimatedShipping: number = 0,
  estimatedTaxes: number = 0.0673
): {
  suggestedPrice: number
  expectedMargin: number
  breakdown: {
    costPrice: number
    channelFees: number
    shipping: number
    taxes: number
    targetMargin: number
  }
} {
  // Fórmula: Preço = (Custo + Frete + Margem Desejada) / (1 - Taxa Canal - Taxa Imposto)
  const channelFeeRate = channel.fees.commission / 100
  const taxRate = estimatedTaxes
  
  // Calcular preço necessário iterativamente (pois as taxas dependem do preço final)
  let suggestedPrice = costPrice * 2 // Chute inicial
  let iteration = 0
  
  while (iteration < 10) { // Máximo 10 iterações
    const channelFees = suggestedPrice * channelFeeRate + channel.fees.fixedFee
    const taxes = suggestedPrice * taxRate
    const totalCosts = costPrice + channelFees + estimatedShipping + taxes
    const currentMargin = suggestedPrice - totalCosts
    const currentMarginPercentage = (currentMargin / suggestedPrice) * 100
    
    if (Math.abs(currentMarginPercentage - targetMarginPercentage) < 0.1) {
      break // Convergiu
    }
    
    // Ajustar preço
    const adjustment = (targetMarginPercentage - currentMarginPercentage) / 100
    suggestedPrice = suggestedPrice * (1 + adjustment)
    iteration++
  }

  const finalChannelFees = suggestedPrice * channelFeeRate + channel.fees.fixedFee
  const finalTaxes = suggestedPrice * taxRate
  const finalMargin = suggestedPrice - costPrice - finalChannelFees - estimatedShipping - finalTaxes

  return {
    suggestedPrice: Math.round(suggestedPrice * 100) / 100,
    expectedMargin: Math.round(finalMargin * 100) / 100,
    breakdown: {
      costPrice,
      channelFees: finalChannelFees,
      shipping: estimatedShipping,
      taxes: finalTaxes,
      targetMargin: finalMargin
    }
  }
}
