'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { apiClient } from '@/lib/api/client'
import { 
  useCurrentUser, 
  useCompany, 
  useProducts, 
  useOrders, 
  useChannels,
  useSalesAnalytics,
  useProductAnalytics,
  useAlerts,
  useTasks
} from '@/hooks/useApi'

export default function ApiTestPage() {
  const [testResults, setTestResults] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  // Security check for admin access
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth')
        const data = await response.json()

        if (data.error) {
          setAuthError('Authentication required')
          return
        }

        // Check if user has admin role or is in development
        const isDev = process.env.NODE_ENV === 'development'
        const isAdmin = data.user?.user_metadata?.role === 'admin'

        if (!isDev && !isAdmin) {
          setAuthError('Admin access required for API testing')
          return
        }

        setIsAuthorized(true)
      } catch (error) {
        setAuthError('Failed to verify authorization')
      }
    }

    checkAuth()
  }, [])

  // Use hooks to test data fetching
  const { data: user, error: userError, isLoading: userLoading } = useCurrentUser()
  const { data: company, error: companyError, isLoading: companyLoading } = useCompany()
  const { data: products, error: productsError, isLoading: productsLoading } = useProducts()
  const { data: orders, error: ordersError, isLoading: ordersLoading } = useOrders()
  const { data: channels, error: channelsError, isLoading: channelsLoading } = useChannels()
  const { data: salesAnalytics, error: salesError, isLoading: salesLoading } = useSalesAnalytics()
  const { data: productAnalytics, error: productAnalyticsError, isLoading: productAnalyticsLoading } = useProductAnalytics()
  const { data: alerts, error: alertsError, isLoading: alertsLoading } = useAlerts()
  const { data: tasks, error: tasksError, isLoading: tasksLoading } = useTasks()

  const testEndpoint = async (name: string, testFn: () => Promise<any>) => {
    setLoading(prev => ({ ...prev, [name]: true }))
    try {
      const result = await testFn()
      setTestResults(prev => ({ 
        ...prev, 
        [name]: { 
          success: true, 
          data: result,
          timestamp: new Date().toISOString()
        }
      }))
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        [name]: { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      }))
    } finally {
      setLoading(prev => ({ ...prev, [name]: false }))
    }
  }

  const testCreateCompany = () => testEndpoint('createCompany', async () => {
    return await apiClient.createCompany({
      name: 'Test Company',
      email: 'test@example.com',
      cnpj: '12.345.678/0001-90',
      phone: '(11) 99999-9999'
    })
  })

  const testCreateProduct = () => testEndpoint('createProduct', async () => {
    return await apiClient.createProduct({
      name: 'Produto Teste',
      sku: 'TEST-001',
      description: 'Produto para teste da API',
      cost_price: 50.00,
      category: 'Eletrônicos',
      brand: 'Teste Brand'
    })
  })

  const testCreateChannel = () => testEndpoint('createChannel', async () => {
    return await apiClient.createChannel({
      name: 'Mercado Livre Teste',
      type: 'marketplace',
      platform: 'mercadolivre',
      fees: {
        commission: 12.5,
        payment: 4.99
      }
    })
  })

  const testCreateAlert = () => testEndpoint('createAlert', async () => {
    return await apiClient.createAlert({
      type: 'stock_low',
      priority: 'high',
      title: 'Estoque Baixo - Produto Teste',
      message: 'O produto TEST-001 está com estoque baixo (5 unidades restantes)',
      data: {
        productId: 'test-product-id',
        currentStock: 5,
        minimumStock: 10
      }
    })
  })

  const testCreateTask = () => testEndpoint('createTask', async () => {
    return await apiClient.createTask({
      title: 'Repor estoque do produto TEST-001',
      description: 'Entrar em contato com fornecedor para reposição de estoque',
      priority: 'high',
      tags: ['estoque', 'urgente']
    })
  })

  const renderTestResult = (name: string, result: any) => {
    if (!result) return null

    return (
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">{name}</CardTitle>
            <Badge variant={result.success ? 'default' : 'destructive'}>
              {result.success ? 'Success' : 'Error'}
            </Badge>
          </div>
          <CardDescription className="text-xs">
            {new Date(result.timestamp).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(result.success ? result.data : result.error, null, 2)}
          </pre>
        </CardContent>
      </Card>
    )
  }

  const renderHookData = (name: string, data: any, error: any, isLoading: boolean) => (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{name}</CardTitle>
          <Badge variant={error ? 'destructive' : isLoading ? 'secondary' : 'default'}>
            {error ? 'Error' : isLoading ? 'Loading' : 'Success'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-red-600 text-sm mb-2">
            Error: {error.message}
          </div>
        )}
        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
          {JSON.stringify(data || error, null, 2)}
        </pre>
      </CardContent>
    </Card>
  )

  // Security gate
  if (!isAuthorized) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-600">{authError || 'Checking authorization...'}</p>
            <p className="text-sm text-gray-500 mt-2">
              This page is restricted to administrators only.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">API Test Dashboard</h1>
        <p className="text-gray-600">Test all ECOMMIND API endpoints</p>
        <div className="mt-2">
          <Badge variant="destructive" className="text-xs">
            🔒 ADMIN ONLY - Testing Environment
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="hooks" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="hooks">Data Hooks</TabsTrigger>
          <TabsTrigger value="mutations">Mutations</TabsTrigger>
        </TabsList>

        <TabsContent value="hooks" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderHookData('Current User', user, userError, userLoading)}
            {renderHookData('Company', company, companyError, companyLoading)}
            {renderHookData('Products', products, productsError, productsLoading)}
            {renderHookData('Orders', orders, ordersError, ordersLoading)}
            {renderHookData('Channels', channels, channelsError, channelsLoading)}
            {renderHookData('Sales Analytics', salesAnalytics, salesError, salesLoading)}
            {renderHookData('Product Analytics', productAnalytics, productAnalyticsError, productAnalyticsLoading)}
            {renderHookData('Alerts', alerts, alertsError, alertsLoading)}
            {renderHookData('Tasks', tasks, tasksError, tasksLoading)}
          </div>
        </TabsContent>

        <TabsContent value="mutations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Button 
              onClick={testCreateCompany}
              disabled={loading.createCompany}
            >
              {loading.createCompany ? 'Testing...' : 'Test Create Company'}
            </Button>
            
            <Button 
              onClick={testCreateProduct}
              disabled={loading.createProduct}
            >
              {loading.createProduct ? 'Testing...' : 'Test Create Product'}
            </Button>
            
            <Button 
              onClick={testCreateChannel}
              disabled={loading.createChannel}
            >
              {loading.createChannel ? 'Testing...' : 'Test Create Channel'}
            </Button>
            
            <Button 
              onClick={testCreateAlert}
              disabled={loading.createAlert}
            >
              {loading.createAlert ? 'Testing...' : 'Test Create Alert'}
            </Button>
            
            <Button
              onClick={testCreateTask}
              disabled={loading.createTask}
            >
              {loading.createTask ? 'Testing...' : 'Test Create Task'}
            </Button>

            <Button
              onClick={() => window.open('/dashboard/configuracoes/bling', '_blank')}
              variant="outline"
            >
              Test Bling Integration
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(testResults).map(([name, result]) => 
              renderTestResult(name, result)
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
