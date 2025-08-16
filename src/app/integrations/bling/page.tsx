'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Database, 
  ExternalLink, 
  RefreshCw, 
  ArrowLeft,
  Shield,
  CheckCircle,
  TrendingUp,
  BarChart3,
  Package
} from 'lucide-react'

export default function BlingIntegrationPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)

  // Check integration status and URL parameters
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/integrations/bling')
        const data = await response.json()

        if (data.connected) {
          setConnected(true)
          setSuccess('✅ Bling já está conectado!')
        }
      } catch (error) {
        console.error('Error checking status:', error)
      } finally {
        setCheckingStatus(false)
      }
    }

    // Check URL parameters for success/error messages
    const urlParams = new URLSearchParams(window.location.search)
    const successParam = urlParams.get('success')
    const errorParam = urlParams.get('error')
    const developmentParam = urlParams.get('development')

    if (successParam) {
      if (developmentParam) {
        setSuccess('✅ Integração simulada com sucesso! (Modo desenvolvimento)')
      } else {
        setSuccess('✅ Bling conectado com sucesso!')
      }
      setConnected(true)
      setCheckingStatus(false)
    } else if (errorParam) {
      setError(`Erro: ${errorParam}`)
      setCheckingStatus(false)
    } else {
      checkStatus()
    }
  }, [])

  const handleConnect = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('Iniciando conexão com Bling...')
      const response = await fetch('/api/integrations/bling/auth')
      const data = await response.json()

      console.log('Resposta da API:', data)

      if (data.error) {
        setError(data.error)
        console.error('Erro da API:', data.error)
        setLoading(false)
      } else if (data.authUrl) {
        console.log('Redirecionando para:', data.authUrl)
        // Use window.location.href for proper OAuth redirect (not fetch/AJAX)
        // This ensures the browser navigates to the Bling authorization page
        window.location.href = data.authUrl
        // Don't set loading to false here - the page will redirect
      } else if (data.connected) {
        setError('Bling já está conectado!')
        setLoading(false)
      } else {
        setError('Resposta inesperada da API')
        setLoading(false)
      }
    } catch (error) {
      console.error('Erro ao conectar:', error)
      setError('Erro de conexão. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-purple-900/30 to-slate-900/50 opacity-20"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl mb-4 shadow-2xl">
              <Database className="h-8 w-8 text-white" />
            </div>

            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-3">
              Integração Bling ERP
            </h1>

            <p className="text-lg text-gray-300 mb-6 max-w-xl mx-auto">
              Conecte seu ERP Bling para sincronizar produtos, pedidos e estoque automaticamente
            </p>

            {/* Aviso de Segurança */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 mb-6 max-w-xl mx-auto">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-green-400 flex-shrink-0 mt-1" />
                <div className="text-left">
                  <h3 className="text-base font-semibold text-white mb-1">
                    🔒 Acesso Seguro e Somente Leitura
                  </h3>
                  <p className="text-white/80 text-sm">
                    <strong>Importante:</strong> O ECOMMIND conecta-se ao seu Bling ERP apenas para <strong>leitura de dados</strong>.
                    Não inserimos, alteramos ou excluímos nenhuma informação no seu sistema.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-xl">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Package className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="font-semibold text-white mb-1 text-sm">Sincronização automática de produtos</h3>
                <p className="text-white/70 text-xs">Mantenha seu catálogo sempre atualizado</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-xl">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                </div>
                <h3 className="font-semibold text-white mb-1 text-sm">Importação de pedidos em tempo real</h3>
                <p className="text-white/70 text-xs">Acompanhe vendas de todos os canais</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-xl">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="h-5 w-5 text-green-400" />
                </div>
                <h3 className="font-semibold text-white mb-1 text-sm">Controle de estoque atualizado</h3>
                <p className="text-white/70 text-xs">Evite rupturas e sobrestoque</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-xl">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-5 w-5 text-yellow-400" />
                </div>
                <h3 className="font-semibold text-white mb-1 text-sm">Cálculos de margem precisos</h3>
                <p className="text-white/70 text-xs">Otimize sua rentabilidade</p>
              </CardContent>
            </Card>
          </div>

          {/* How it Works */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl mb-6">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-white mb-4 text-center">
                Como Funciona
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg font-bold text-blue-400">1</span>
                  </div>
                  <h3 className="font-semibold text-white mb-1 text-sm">Clique em Conectar</h3>
                  <p className="text-white/70 text-xs">Você será redirecionado para o site do Bling</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg font-bold text-purple-400">2</span>
                  </div>
                  <h3 className="font-semibold text-white mb-1 text-sm">Autorize a Integração</h3>
                  <p className="text-white/70 text-xs">Faça login no Bling e clique em "Autorizar"</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-1 text-sm">Pronto!</h3>
                  <p className="text-white/70 text-xs">A sincronização começará automaticamente</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <div className="text-center">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-4">
              <h2 className="text-xl font-bold text-white mb-3">
                Pronto para começar?
              </h2>
              <p className="text-white/80 mb-4 text-sm">
                Conecte seu Bling ERP agora e comece a receber insights valiosos sobre seu negócio
              </p>
              
              <Button
                onClick={handleConnect}
                disabled={loading || checkingStatus || connected}
                size="lg"
                className={`px-8 py-4 text-lg font-semibold shadow-2xl ${
                  connected
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                } text-white`}
              >
                {checkingStatus ? (
                  <>
                    <RefreshCw className="mr-3 h-6 w-6 animate-spin" />
                    Verificando...
                  </>
                ) : loading ? (
                  <>
                    <RefreshCw className="mr-3 h-6 w-6 animate-spin" />
                    Conectando...
                  </>
                ) : connected ? (
                  <>
                    <CheckCircle className="mr-3 h-6 w-6" />
                    Bling Conectado
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-3 h-6 w-6" />
                    Conectar Bling Agora
                  </>
                )}
              </Button>
              
              {!connected && (
                <p className="text-white/60 text-sm mt-4">
                  Você será redirecionado para o site do Bling para autorizar a conexão
                </p>
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-300 text-sm">
                    <strong>Erro:</strong> {error}
                  </p>
                </div>
              )}

              {success && (
                <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-green-300 text-sm">
                    {success}
                  </p>
                </div>
              )}
            </div>
            
            <p className="text-white/50 text-xs">
              ⚡ Processo automático • 🔒 100% seguro • ⏱️ 30 segundos
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
