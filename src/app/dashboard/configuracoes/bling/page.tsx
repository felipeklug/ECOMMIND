'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
  Database,
  AlertTriangle,
  ArrowLeft,
  Shield
} from 'lucide-react'

export default function BlingConfigPage() {
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [credentials, setCredentials] = useState({
    clientId: '',
    clientSecret: ''
  })

  useEffect(() => {
    checkConnection()
    
    // Check for URL parameters (OAuth callback)
    const urlParams = new URLSearchParams(window.location.search)
    const blingSuccess = urlParams.get('bling_success')
    const blingError = urlParams.get('bling_error')
    
    if (blingSuccess) {
      setError(null)
      setConnected(true)
    } else if (blingError) {
      setError(`Erro na conexão com Bling: ${blingError}`)
    }
  }, [])

  const checkConnection = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/integrations/bling/sync')
      const data = await response.json()
      
      if (data.error) {
        setError(data.error)
        setConnected(false)
      } else {
        setConnected(data.connected || false)
        setError(null)
      }
    } catch (error) {
      setError('Erro ao verificar conexão')
      setConnected(false)
    } finally {
      setLoading(false)
    }
  }

  const connectBling = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/integrations/bling/auth')
      const data = await response.json()
      
      if (data.error) {
        setError(data.error)
      } else if (data.authUrl) {
        // Redirect to Bling OAuth
        window.location.href = data.authUrl
      } else if (data.connected) {
        setConnected(true)
        setError(null)
      }
    } catch (error) {
      setError('Erro ao conectar com Bling')
    } finally {
      setLoading(false)
    }
  }

  const disconnectBling = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/integrations/bling/auth', {
        method: 'POST'
      })
      const data = await response.json()
      
      if (data.error) {
        setError(data.error)
      } else {
        setConnected(false)
        setError(null)
      }
    } catch (error) {
      setError('Erro ao desconectar Bling')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Integração Bling ERP</h1>
            <p className="text-gray-600 text-sm">Conecte seu ERP para sincronizar produtos, pedidos e estoque</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {connected ? (
            <Badge variant="default" className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4" />
              <span>Conectado</span>
            </Badge>
          ) : (
            <Badge variant="destructive" className="flex items-center space-x-1">
              <XCircle className="h-4 w-4" />
              <span>Desconectado</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Aviso sobre Acesso Somente Leitura */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Shield className="h-5 w-5 text-green-600 mt-0.5" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-green-800">
              🔒 Acesso Seguro e Somente Leitura
            </h3>
            <p className="text-sm text-green-700 mt-1">
              <strong>Importante:</strong> O ECOMMIND conecta-se ao seu Bling ERP apenas para <strong>leitura de dados</strong>.
              Não inserimos, alteramos ou excluímos nenhuma informação no seu sistema.
              Utilizamos os dados apenas para gerar insights estratégicos e relatórios para sua empresa.
            </p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status da Conexão */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Status da Conexão</span>
            </CardTitle>
            <CardDescription>
              Estado atual da integração com Bling ERP
            </CardDescription>
          </CardHeader>
          <CardContent>
            {connected ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">✅ Bling Conectado</h4>
                  <p className="text-sm text-green-800">
                    Sua conta Bling está conectada e funcionando corretamente.
                  </p>
                </div>
                
                <Button 
                  variant="destructive" 
                  onClick={disconnectBling}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Desconectando...
                    </>
                  ) : (
                    'Desconectar Bling'
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">⚠️ Não Conectado</h4>
                  <p className="text-sm text-yellow-800">
                    Conecte sua conta Bling para começar a sincronizar dados.
                  </p>
                </div>
                
                <Button 
                  onClick={connectBling}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Conectar com Bling
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Benefícios da Integração */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Por que conectar o Bling?</span>
            </CardTitle>
            <CardDescription>
              Veja os benefícios da integração com seu ERP
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium text-sm">Sincronização automática de produtos</h4>
                  <p className="text-xs text-gray-600">Mantenha seu catálogo sempre atualizado</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium text-sm">Importação de pedidos em tempo real</h4>
                  <p className="text-xs text-gray-600">Acompanhe vendas de todos os canais</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium text-sm">Controle de estoque atualizado</h4>
                  <p className="text-xs text-gray-600">Evite rupturas e sobrestoque</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium text-sm">Cálculos de margem precisos</h4>
                  <p className="text-xs text-gray-600">Otimize sua rentabilidade</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg mt-4">
              <p className="text-xs text-blue-800">
                <strong>⚡ Processo simples:</strong> Clique em "Conectar com Bling" e autorize a integração.
                Não é necessário configurar nada manualmente!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instruções Simplificadas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🚀 Como Conectar</CardTitle>
          <CardDescription>
            Processo simples e rápido para conectar seu Bling ERP
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Clique em "Conectar com Bling"</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Você será redirecionado para o site do Bling
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Autorize a integração</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Faça login no Bling e clique em "Autorizar"
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Pronto!</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Você será redirecionado de volta e a sincronização começará
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4">
              <h4 className="font-medium text-sm mb-2">⚡ Processo Automático</h4>
              <p className="text-xs text-gray-700 mb-3">
                Não é necessário buscar Client ID, Secret ou configurar nada manualmente.
                O ECOMMIND cuida de toda a configuração técnica para você!
              </p>
              <div className="text-xs text-gray-600">
                <strong>Tempo estimado:</strong> 30 segundos
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {!connected && (
        <div className="text-center">
          <Button
            onClick={connectBling}
            disabled={loading}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                Conectando...
              </>
            ) : (
              <>
                <ExternalLink className="mr-2 h-5 w-5" />
                Conectar com Bling Agora
              </>
            )}
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            Você será redirecionado para o site do Bling para autorizar a conexão
          </p>
        </div>
        </CardContent>
      </Card>
    </div>
  )
}
