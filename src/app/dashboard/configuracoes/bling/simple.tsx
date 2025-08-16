'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  AlertTriangle,
  Database
} from 'lucide-react'

export default function SimpleBlingConfig() {
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [credentials, setCredentials] = useState({
    clientId: '',
    clientSecret: ''
  })

  const handleConnect = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/integrations/bling/auth')
      const data = await response.json()
      
      if (data.error) {
        setError(data.error)
      } else if (data.authUrl) {
        window.location.href = data.authUrl
      } else if (data.connected) {
        setConnected(true)
      }
    } catch (error) {
      setError('Erro ao conectar com Bling')
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    setLoading(true)
    
    try {
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

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Integração Bling ERP</h1>
        <p className="text-gray-600">Conecte seu ERP Bling para sincronizar dados automaticamente</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status da Conexão */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Status da Conexão</span>
                </CardTitle>
                <CardDescription>
                  Estado atual da integração com Bling
                </CardDescription>
              </div>
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
                  onClick={handleDisconnect}
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
                  onClick={handleConnect}
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

        {/* Configuração Manual */}
        <Card>
          <CardHeader>
            <CardTitle>Configuração Manual</CardTitle>
            <CardDescription>
              Configure as credenciais do Bling manualmente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="clientId">Client ID</Label>
              <Input
                id="clientId"
                value={credentials.clientId}
                onChange={(e) => setCredentials({...credentials, clientId: e.target.value})}
                placeholder="Seu Client ID do Bling"
              />
            </div>
            
            <div>
              <Label htmlFor="clientSecret">Client Secret</Label>
              <Input
                id="clientSecret"
                type="password"
                value={credentials.clientSecret}
                onChange={(e) => setCredentials({...credentials, clientSecret: e.target.value})}
                placeholder="Seu Client Secret do Bling"
              />
            </div>

            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Como obter as credenciais:</strong><br />
                1. Acesse <a href="https://developer.bling.com.br" target="_blank" className="underline">developer.bling.com.br</a><br />
                2. Crie uma aplicação OAuth<br />
                3. Configure o Redirect URI<br />
                4. Copie o Client ID e Secret
              </p>
            </div>

            <Button variant="outline" className="w-full">
              Salvar Credenciais
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Instruções */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Como Configurar a Integração</CardTitle>
          <CardDescription>
            Siga estes passos para conectar seu Bling ERP
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h4 className="font-medium mb-2">Criar Aplicação</h4>
              <p className="text-sm text-gray-600">
                Acesse o portal do desenvolvedor Bling e crie uma nova aplicação OAuth
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <h4 className="font-medium mb-2">Configurar Redirect</h4>
              <p className="text-sm text-gray-600">
                Configure o Redirect URI para: <br />
                <code className="text-xs bg-gray-100 px-1 rounded">
                  {window.location.origin}/api/integrations/bling/callback
                </code>
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <h4 className="font-medium mb-2">Conectar</h4>
              <p className="text-sm text-gray-600">
                Clique em "Conectar com Bling" e autorize a aplicação
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
