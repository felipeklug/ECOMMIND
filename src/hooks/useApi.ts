'use client'

import useSWR from 'swr'
import { apiClient } from '@/lib/api/client'

// Generic hook for API calls with SWR
function useApiCall<T>(
  key: string | null,
  fetcher: () => Promise<any>,
  options?: any
) {
  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const response = await fetcher()
      if (response.error) {
        throw new Error(response.error)
      }
      return response.data
    },
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
      ...options
    }
  )

  return {
    data,
    error,
    isLoading,
    refresh: mutate
  }
}

// Auth hooks
export function useCurrentUser() {
  return useApiCall(
    'current-user',
    () => apiClient.getCurrentUser(),
    {
      refreshInterval: 300000, // 5 minutes
      revalidateOnFocus: true
    }
  )
}

// Company hooks
export function useCompany() {
  return useApiCall(
    'company',
    () => apiClient.getCompany(),
    {
      refreshInterval: 600000 // 10 minutes
    }
  )
}

// Products hooks
export function useProducts(params?: Record<string, string>) {
  const key = params ? `products-${JSON.stringify(params)}` : 'products'
  
  return useApiCall(
    key,
    () => apiClient.getProducts(params),
    {
      refreshInterval: 300000 // 5 minutes
    }
  )
}

// Orders hooks
export function useOrders(params?: Record<string, string>) {
  const key = params ? `orders-${JSON.stringify(params)}` : 'orders'
  
  return useApiCall(
    key,
    () => apiClient.getOrders(params),
    {
      refreshInterval: 60000 // 1 minute for orders
    }
  )
}

// Channels hooks
export function useChannels() {
  return useApiCall(
    'channels',
    () => apiClient.getChannels(),
    {
      refreshInterval: 600000 // 10 minutes
    }
  )
}

// Analytics hooks
export function useSalesAnalytics(params?: Record<string, string>) {
  const key = params ? `sales-analytics-${JSON.stringify(params)}` : 'sales-analytics'
  
  return useApiCall(
    key,
    () => apiClient.getSalesAnalytics(params),
    {
      refreshInterval: 60000 // 1 minute for real-time data
    }
  )
}

export function useProductAnalytics(params?: Record<string, string>) {
  const key = params ? `product-analytics-${JSON.stringify(params)}` : 'product-analytics'
  
  return useApiCall(
    key,
    () => apiClient.getProductAnalytics(params),
    {
      refreshInterval: 300000 // 5 minutes
    }
  )
}

// Alerts hooks
export function useAlerts(params?: Record<string, string>) {
  const key = params ? `alerts-${JSON.stringify(params)}` : 'alerts'
  
  return useApiCall(
    key,
    () => apiClient.getAlerts(params),
    {
      refreshInterval: 30000 // 30 seconds for alerts
    }
  )
}

// Tasks hooks
export function useTasks(params?: Record<string, string>) {
  const key = params ? `tasks-${JSON.stringify(params)}` : 'tasks'
  
  return useApiCall(
    key,
    () => apiClient.getTasks(params),
    {
      refreshInterval: 60000 // 1 minute
    }
  )
}

// Mutation hooks for creating/updating data
export function useCreateProduct() {
  return async (data: any) => {
    const response = await apiClient.createProduct(data)
    if (response.error) {
      throw new Error(response.error)
    }
    return response.data
  }
}

export function useCreateOrder() {
  return async (data: any) => {
    const response = await apiClient.createOrder(data)
    if (response.error) {
      throw new Error(response.error)
    }
    return response.data
  }
}

export function useCreateChannel() {
  return async (data: any) => {
    const response = await apiClient.createChannel(data)
    if (response.error) {
      throw new Error(response.error)
    }
    return response.data
  }
}

export function useUpdateChannel() {
  return async (data: any) => {
    const response = await apiClient.updateChannel(data)
    if (response.error) {
      throw new Error(response.error)
    }
    return response.data
  }
}

export function useCreateAlert() {
  return async (data: any) => {
    const response = await apiClient.createAlert(data)
    if (response.error) {
      throw new Error(response.error)
    }
    return response.data
  }
}

export function useUpdateAlert() {
  return async (data: any) => {
    const response = await apiClient.updateAlert(data)
    if (response.error) {
      throw new Error(response.error)
    }
    return response.data
  }
}

export function useCreateTask() {
  return async (data: any) => {
    const response = await apiClient.createTask(data)
    if (response.error) {
      throw new Error(response.error)
    }
    return response.data
  }
}

export function useUpdateTask() {
  return async (data: any) => {
    const response = await apiClient.updateTask(data)
    if (response.error) {
      throw new Error(response.error)
    }
    return response.data
  }
}
