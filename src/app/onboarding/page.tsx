'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import {
  Building2,
  ExternalLink,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Zap,
  Database,
  MessageSquare,
  Shield
} from 'lucide-react'
import { apiClient } from '@/lib/api/client'

interface OnboardingStep {
  id: string
  title: string
  description: string
  completed: boolean
}

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [companyData, setCompanyData] = useState({
    name: '',
    cnpj: '',
    email: '',
    phone: ''
  })

  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [blingConnected, setBlingConnected] = useState(false)
  const [syncCompleted, setSyncCompleted] = useState(false)

  const steps: OnboardingStep[] = [
    {
      id: 'company',
      title: 'Dados da Empresa',
      description: 'Informações básicas da sua empresa',
      completed: false
    },
    {
      id: 'bling',
      title: 'Integração Bling ERP',
      description: 'Conecte seu ERP para sincronizar dados',
      completed: false
    },
    {
      id: 'sync',
      title: 'Sincronização Inicial',
      description: 'Importar produtos e pedidos do Bling',
      completed: false
    },
    {
      id: 'complete',
      title: 'Configuração Concluída',
      description: 'Sua conta está pronta para uso!',
      completed: false
    }
  ]

  const progress = ((currentStep + 1) / steps.length) * 100

  useEffect(() => {
    // Check if user already has company data
    checkExistingData()
  }, [])

  const checkExistingData = async () => {
    try {
      const response = await apiClient.getCompany()
      if (response.data && !response.error) {
        setCompanyData(response.data)
        setCurrentStep(1) // Skip to Bling integration
      }
    } catch (error) {
      // User doesn't have company data yet
    }
  }

  const handleCompanySubmit = async () => {
    // Validações da empresa
    if (!companyData.name || !companyData.email) {
      setError('Nome da empresa e email são obrigatórios')
      return
    }

    // Validações do usuário
    if (!userData.fullName || !userData.email || !userData.password) {
      setError('Todos os campos do usuário são obrigatórios')
      return
    }

    if (userData.password !== userData.confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    if (userData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.createCompany({
        company: companyData,
        user: userData
      })

      if (response.error) {
        setError(response.error)
      } else {
        setCurrentStep(1)
      }
    } catch (error) {
      setError('Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  const handleBlingConnect = async () => {
    // Redirect to Bling configuration page
    window.location.href = '/dashboard/configuracoes/bling'
  }

  const handleSync = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/integrations/bling/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          syncType: 'all',
          fullSync: false,
          limit: 100
        })
      })

      const data = await response.json()
      
      if (data.error) {
        setError(data.error)
      } else {
        setSyncCompleted(true)
        setCurrentStep(3)
      }
    } catch (error) {
      setError('Erro durante sincronização')
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = () => {
    router.push('/dashboard')
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="w-full max-w-lg">
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl shadow-black/20">
              <CardHeader className="text-center pb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl mb-3 mx-auto shadow-lg shadow-purple-500/25">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-white mb-1">
                  Criar Sua Conta
                </CardTitle>
                <CardDescription className="text-gray-300 text-sm">
                  Vamos criar sua conta e configurar os dados da sua empresa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Seção do Usuário */}
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-white border-b border-white/20 pb-1">
                    Dados do Responsável
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="fullName" className="text-white text-sm">
                        Nome Completo *
                      </Label>
                      <Input
                        id="fullName"
                        value={userData.fullName}
                        onChange={(e) => setUserData({...userData, fullName: e.target.value})}
                        placeholder="João Silva"
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20 h-9 text-sm backdrop-blur-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="userEmail" className="text-white text-sm">
                        Email do Usuário *
                      </Label>
                      <Input
                        id="userEmail"
                        type="email"
                        value={userData.email}
                        onChange={(e) => setUserData({...userData, email: e.target.value})}
                        placeholder="joao@minhaloja.com"
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20 h-9 text-sm backdrop-blur-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="password" className="text-white text-sm">
                        Senha *
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={userData.password}
                        onChange={(e) => setUserData({...userData, password: e.target.value})}
                        placeholder="Mínimo 6 caracteres"
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20 h-9 text-sm backdrop-blur-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="confirmPassword" className="text-white text-sm">
                        Confirmar Senha *
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={userData.confirmPassword}
                        onChange={(e) => setUserData({...userData, confirmPassword: e.target.value})}
                        placeholder="Confirme sua senha"
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20 h-9 text-sm backdrop-blur-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Seção da Empresa */}
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-white border-b border-white/20 pb-1">
                    Dados da Empresa
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="name" className="text-white text-sm">
                        Nome da Empresa *
                      </Label>
                      <Input
                        id="name"
                        value={companyData.name}
                        onChange={(e) => setCompanyData({...companyData, name: e.target.value})}
                        placeholder="Ex: Minha Loja Online"
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20 h-9 text-sm backdrop-blur-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="cnpj" className="text-white text-sm">
                        CNPJ
                      </Label>
                      <Input
                        id="cnpj"
                        value={companyData.cnpj}
                        onChange={(e) => setCompanyData({...companyData, cnpj: e.target.value})}
                        placeholder="00.000.000/0001-00"
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20 h-9 text-sm backdrop-blur-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="email" className="text-white text-sm">
                        Email da Empresa *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={companyData.email}
                        onChange={(e) => setCompanyData({...companyData, email: e.target.value})}
                        placeholder="contato@minhaloja.com"
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20 h-9 text-sm backdrop-blur-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="phone" className="text-white text-sm">
                        Telefone
                      </Label>
                      <Input
                        id="phone"
                        value={companyData.phone}
                        onChange={(e) => setCompanyData({...companyData, phone: e.target.value})}
                        placeholder="(11) 99999-9999"
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20 h-12 text-base backdrop-blur-sm"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleCompanySubmit}
                  disabled={loading || !companyData.name || !companyData.email || !userData.fullName || !userData.email || !userData.password || !userData.confirmPassword}
                  className="w-full h-12 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold text-base shadow-lg shadow-purple-500/25 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    <>
                      Criar Conta e Continuar
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )

      case 1:
        return (
          <div className="w-full max-w-lg">
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl shadow-black/20">
              <CardHeader className="text-center pb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl mb-4 mx-auto shadow-lg shadow-green-500/25">
                  <Database className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-white mb-2">
                  Integração Bling ERP
                </CardTitle>
                <CardDescription className="text-gray-300 text-base">
                  Conecte seu ERP Bling para sincronizar produtos, pedidos e estoque automaticamente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6 rounded-xl border border-blue-500/20 backdrop-blur-sm">
                  <h4 className="font-semibold text-white mb-4 flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-blue-400" />
                    Por que conectar o Bling?
                  </h4>
                  <ul className="text-gray-300 space-y-3">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                      Sincronização automática de produtos
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                      Importação de pedidos em tempo real
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                      Controle de estoque atualizado
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                      Cálculos de margem precisos
                    </li>
                  </ul>
                </div>

                {/* Aviso sobre Acesso Somente Leitura */}
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-green-300 mb-1">
                        🔒 Acesso Seguro e Somente Leitura
                      </h4>
                      <p className="text-xs text-green-200">
                        <strong>Importante:</strong> O ECOMMIND conecta-se ao seu Bling ERP apenas para <strong>leitura de dados</strong>.
                        Não inserimos, alteramos ou excluímos nenhuma informação no seu sistema.
                      </p>
                    </div>
                  </div>
                </div>

                {blingConnected ? (
                  <div className="flex items-center space-x-3 p-4 bg-green-500/10 rounded-xl border border-green-500/20 backdrop-blur-sm">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                    <span className="text-green-300 font-medium">Bling conectado com sucesso!</span>
                  </div>
                ) : (
                  <Alert className="bg-yellow-500/10 border-yellow-500/20 backdrop-blur-sm">
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    <AlertDescription className="text-yellow-200">
                      Você será redirecionado para o site do Bling para autorizar a conexão.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(0)}
                    className="flex-1 h-12 bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Voltar
                  </Button>

                  {blingConnected ? (
                    <Button
                      onClick={() => setCurrentStep(2)}
                      className="flex-1 h-12 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold shadow-lg shadow-purple-500/25 transition-all duration-200 transform hover:scale-[1.02]"
                    >
                      Continuar
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleBlingConnect}
                      className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold shadow-lg shadow-green-500/25 transition-all duration-200 transform hover:scale-[1.02]"
                    >
                      <ExternalLink className="mr-2 h-5 w-5" />
                      Conectar Bling
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 2:
        return (
          <div className="w-full max-w-lg">
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl shadow-black/20">
              <CardHeader className="text-center pb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl mb-4 mx-auto shadow-lg shadow-yellow-500/25">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-white mb-2">
                  Sincronização Inicial
                </CardTitle>
                <CardDescription className="text-gray-300 text-base">
                  Vamos importar seus dados do Bling para começar a usar o ECOMMIND
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-6 rounded-xl border border-yellow-500/20 backdrop-blur-sm">
                  <h4 className="font-semibold text-white mb-4 flex items-center">
                    <Database className="h-5 w-5 mr-2 text-yellow-400" />
                    O que será importado:
                  </h4>
                  <ul className="text-gray-300 space-y-3">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                      Catálogo de produtos
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
                      Pedidos dos últimos 30 dias
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                      Níveis de estoque atuais
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                      Dados de clientes
                    </li>
                  </ul>
                </div>

                {syncCompleted ? (
                  <div className="flex items-center space-x-3 p-4 bg-green-500/10 rounded-xl border border-green-500/20 backdrop-blur-sm">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                    <span className="text-green-300 font-medium">Sincronização concluída!</span>
                  </div>
                ) : (
                  <Alert className="bg-blue-500/10 border-blue-500/20 backdrop-blur-sm">
                    <AlertTriangle className="h-4 w-4 text-blue-400" />
                    <AlertDescription className="text-blue-200">
                      Este processo pode levar alguns minutos dependendo da quantidade de dados.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 h-12 bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm"
                    disabled={loading}
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Voltar
                  </Button>

                  {syncCompleted ? (
                    <Button
                      onClick={() => setCurrentStep(3)}
                      className="flex-1 h-12 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold shadow-lg shadow-purple-500/25 transition-all duration-200 transform hover:scale-[1.02]"
                    >
                      Finalizar
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSync}
                      disabled={loading}
                      className="flex-1 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold shadow-lg shadow-yellow-500/25 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Sincronizando...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-5 w-5" />
                          Iniciar Sync
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 3:
        return (
          <div className="w-full max-w-lg">
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl shadow-black/20">
              <CardHeader className="text-center pb-8">
                <div className="relative mx-auto mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/25">
                    <CheckCircle className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur opacity-30 animate-pulse"></div>
                </div>
                <CardTitle className="text-3xl font-bold text-white mb-3">
                  Parabéns! 🎉
                </CardTitle>
                <CardDescription className="text-gray-300 text-lg">
                  Sua conta ECOMMIND está configurada e pronta para uso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-6 rounded-xl border border-green-500/20 backdrop-blur-sm">
                  <h4 className="font-semibold text-white mb-4 flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-green-400" />
                    Próximos passos:
                  </h4>
                  <ul className="text-gray-300 space-y-3">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                      Explore o dashboard com seus dados reais
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                      Configure alertas personalizados
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                      Conecte o WhatsApp Business (opcional)
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                      Defina metas de vendas e margem
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={handleComplete}
                  className="w-full h-14 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold text-lg shadow-2xl shadow-green-500/25 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-green-500/40"
                  size="lg"
                >
                  <MessageSquare className="mr-3 h-6 w-6" />
                  Ir para o Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
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
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl mb-4 shadow-2xl">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-3">
              Bem-vindo ao ECOMMIND
            </h1>
            <p className="text-lg text-gray-300 max-w-xl mx-auto leading-relaxed">
              Transforme seu e-commerce com inteligência artificial. Vamos configurar sua conta em poucos passos.
            </p>
          </div>

          {/* Progress Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div className="text-left">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Passo {currentStep + 1} de {steps.length}
                </span>
                <h2 className="text-xl font-semibold text-white mt-1">
                  {steps[currentStep]?.title}
                </h2>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {Math.round(progress)}%
                </span>
                <p className="text-xs text-gray-400">concluído</p>
              </div>
            </div>

            {/* Enhanced Progress Bar */}
            <div className="relative">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-700 ease-out relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Steps Indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-6">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="relative">
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold transition-all duration-500 transform
                      ${index <= currentStep
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/25 scale-110'
                        : 'bg-white/10 text-gray-400 backdrop-blur-sm'
                      }
                    `}>
                      {index < currentStep ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : index === currentStep ? (
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                      ) : (
                        index + 1
                      )}
                    </div>
                    {index <= currentStep && (
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl blur opacity-30 animate-pulse"></div>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`
                      w-16 h-0.5 mx-4 transition-all duration-500
                      ${index < currentStep
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500'
                        : 'bg-white/20'
                      }
                    `} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-8 flex justify-center">
              <Alert variant="destructive" className="max-w-md bg-red-500/10 border-red-500/20 backdrop-blur-sm">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-red-200">{error}</AlertDescription>
              </Alert>
            </div>
          )}

          {/* Step Content */}
          <div className="flex justify-center">
            {renderStepContent()}
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-gray-400 text-sm">
              Precisa de ajuda? Entre em contato conosco em{' '}
              <a
                href="mailto:suporte@ecommind.com"
                className="text-purple-400 hover:text-purple-300 transition-colors duration-200 underline decoration-purple-400/50 hover:decoration-purple-300"
              >
                suporte@ecommind.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
