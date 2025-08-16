// React hooks for business data with SWR caching
// Ready to be replaced with real API calls

'use client'

import useSWR from 'swr'
import { BusinessService } from '@/lib/services/businessService'
import type { 
  SalesMetrics, 
  ProductMetrics, 
  ChannelMetrics, 
  StockAnalysis, 
  StockPrediction, 
  StockAlert,
  Alert,
  Task,
  Product,
  Channel,
  Order
} from '@/types/business'
import type { MarginByProduct } from '@/lib/calculations/margin'

const businessService = BusinessService.getInstance()

// ===== SALES HOOKS =====

export function useSalesMetrics(period: 'today' | 'week' | 'month' = 'today') {
  const { data, error, isLoading, mutate } = useSWR(
    `sales-metrics-${period}`,
    () => businessService.getSalesMetrics(period),
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true
    }
  )

  return {
    metrics: data,
    isLoading,
    error,
    refresh: mutate
  }
}

export function useChannelMetrics() {
  const { data, error, isLoading, mutate } = useSWR(
    'channel-metrics',
    () => businessService.getChannelMetrics(),
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true
    }
  )

  return {
    channels: data || [],
    isLoading,
    error,
    refresh: mutate
  }
}

export function useProductMetrics() {
  const { data, error, isLoading, mutate } = useSWR(
    'product-metrics',
    () => businessService.getProductMetrics(),
    {
      refreshInterval: 60000,
      revalidateOnFocus: true
    }
  )

  return {
    products: data || [],
    isLoading,
    error,
    refresh: mutate
  }
}

// ===== STOCK HOOKS =====

export function useStockAnalysis() {
  const { data, error, isLoading, mutate } = useSWR(
    'stock-analysis',
    () => businessService.getStockAnalysis(),
    {
      refreshInterval: 300000, // Refresh every 5 minutes
      revalidateOnFocus: true
    }
  )

  return {
    stockAnalysis: data || [],
    isLoading,
    error,
    refresh: mutate
  }
}

export function useStockPredictions() {
  const { data, error, isLoading, mutate } = useSWR(
    'stock-predictions',
    () => businessService.getStockPredictions(),
    {
      refreshInterval: 3600000, // Refresh every hour
      revalidateOnFocus: false
    }
  )

  return {
    predictions: data || [],
    isLoading,
    error,
    refresh: mutate
  }
}

export function useStockAlerts() {
  const { data, error, isLoading, mutate } = useSWR(
    'stock-alerts',
    () => businessService.getStockAlerts(),
    {
      refreshInterval: 300000, // Refresh every 5 minutes
      revalidateOnFocus: true
    }
  )

  return {
    stockAlerts: data || [],
    isLoading,
    error,
    refresh: mutate
  }
}

// ===== MARGIN HOOKS =====

export function useLowMarginProducts(threshold: number = 20) {
  const { data, error, isLoading, mutate } = useSWR(
    `low-margin-products-${threshold}`,
    () => businessService.getLowMarginProducts(threshold),
    {
      refreshInterval: 300000,
      revalidateOnFocus: true
    }
  )

  return {
    lowMarginProducts: data || [],
    isLoading,
    error,
    refresh: mutate
  }
}

export function usePriceSuggestion(productId: string, channelId: string, targetMargin: number = 25) {
  const { data, error, isLoading, mutate } = useSWR(
    productId && channelId ? `price-suggestion-${productId}-${channelId}-${targetMargin}` : null,
    () => businessService.getPriceSuggestions(productId, channelId, targetMargin),
    {
      revalidateOnFocus: false,
      refreshInterval: 0 // Only refresh manually
    }
  )

  return {
    priceSuggestion: data,
    isLoading,
    error,
    refresh: mutate
  }
}

// ===== ALERTS & TASKS HOOKS =====

export function useAlerts(unreadOnly: boolean = false) {
  const { data, error, isLoading, mutate } = useSWR(
    `alerts-${unreadOnly}`,
    () => businessService.getAlerts(unreadOnly),
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true
    }
  )

  return {
    alerts: data || [],
    isLoading,
    error,
    refresh: mutate
  }
}

export function useTasks(status?: Task['status']) {
  const { data, error, isLoading, mutate } = useSWR(
    `tasks-${status || 'all'}`,
    () => businessService.getTasks(status),
    {
      refreshInterval: 60000,
      revalidateOnFocus: true
    }
  )

  return {
    tasks: data || [],
    isLoading,
    error,
    refresh: mutate
  }
}

// ===== BASIC DATA HOOKS =====

export function useProducts() {
  const { data, error, isLoading, mutate } = useSWR(
    'products',
    () => businessService.getProducts(),
    {
      refreshInterval: 300000,
      revalidateOnFocus: false
    }
  )

  return {
    products: data || [],
    isLoading,
    error,
    refresh: mutate
  }
}

export function useChannels() {
  const { data, error, isLoading, mutate } = useSWR(
    'channels',
    () => businessService.getChannels(),
    {
      refreshInterval: 300000,
      revalidateOnFocus: false
    }
  )

  return {
    channels: data || [],
    isLoading,
    error,
    refresh: mutate
  }
}

export function useOrders(limit?: number) {
  const { data, error, isLoading, mutate } = useSWR(
    `orders-${limit || 'all'}`,
    () => businessService.getOrders(limit),
    {
      refreshInterval: 60000,
      revalidateOnFocus: true
    }
  )

  return {
    orders: data || [],
    isLoading,
    error,
    refresh: mutate
  }
}

// ===== DASHBOARD SUMMARY HOOK =====

export function useDashboardSummary() {
  const { metrics: todayMetrics, isLoading: loadingToday } = useSalesMetrics('today')
  const { metrics: weekMetrics, isLoading: loadingWeek } = useSalesMetrics('week')
  const { channels, isLoading: loadingChannels } = useChannelMetrics()
  const { alerts, isLoading: loadingAlerts } = useAlerts(true) // Only unread
  const { orders, isLoading: loadingOrders } = useOrders(10) // Last 10 orders

  const isLoading = loadingToday || loadingWeek || loadingChannels || loadingAlerts || loadingOrders

  return {
    summary: {
      today: todayMetrics,
      week: weekMetrics,
      channels: channels.slice(0, 3), // Top 3 channels
      criticalAlerts: alerts.filter(alert => alert.priority === 'critical' || alert.priority === 'high'),
      recentOrders: orders.slice(0, 5)
    },
    isLoading,
    refresh: () => {
      // This would trigger refresh of all data
      // In a real implementation, you might want to use a global refresh mechanism
    }
  }
}

// ===== UTILITY HOOKS =====

export function useBusinessData() {
  const salesMetrics = useSalesMetrics('today')
  const channelMetrics = useChannelMetrics()
  const productMetrics = useProductMetrics()
  const stockAnalysis = useStockAnalysis()
  const alerts = useAlerts()
  const tasks = useTasks()

  return {
    sales: salesMetrics,
    channels: channelMetrics,
    products: productMetrics,
    stock: stockAnalysis,
    alerts,
    tasks,
    isLoading: salesMetrics.isLoading || channelMetrics.isLoading || productMetrics.isLoading,
    hasError: salesMetrics.error || channelMetrics.error || productMetrics.error,
    refreshAll: () => {
      salesMetrics.refresh()
      channelMetrics.refresh()
      productMetrics.refresh()
      stockAnalysis.refresh()
      alerts.refresh()
      tasks.refresh()
    }
  }
}
