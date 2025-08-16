import { BarChart3, Bell, Calendar, MessageSquare, TrendingUp, Zap, Shield, Target, Clock, Users, DollarSign, AlertTriangle } from 'lucide-react'
import { BrainLogo } from '@/components/shared/brain-logo'

export default function FuncionalidadesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Clean */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <BrainLogo size="xl" />
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">ECOMMIND</h1>
                <p className="text-xs text-neutral-600 -mt-1 font-medium">Gestão Inteligente</p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-10">
              <a href="/" className="text-neutral-600 hover:text-accent-500 transition-colors font-medium text-lg">
                Início
              </a>
              <a href="/funcionalidades" className="text-accent-500 font-medium text-lg">
                Funcionalidades
              </a>
              <a href="/precos" className="text-neutral-600 hover:text-accent-500 transition-colors font-medium text-lg">
                Preços
              </a>
              <a href="/contato" className="text-neutral-600 hover:text-accent-500 transition-colors font-medium text-lg">
                Contato
              </a>
            </nav>
            <div className="flex items-center space-x-4">
              <a href="/login" className="text-neutral-600 hover:text-neutral-900 font-medium">
                Entrar
              </a>
              <a className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                 style={{ borderRadius: 'var(--radius)' }}>
                Começar grátis
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ 
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
        minHeight: '60vh'
      }}>
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-violet-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="container-pro pt-20 pb-24 relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-8">
            Funcionalidades que <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-400">transformam</span> seu e-commerce
          </h1>
          <p className="text-xl text-purple-100 max-w-3xl mx-auto leading-relaxed">
            Descubra como o ECOMMIND revoluciona a gestão do seu e-commerce com BI em tempo real, 
            alertas inteligentes e gestão conversacional via WhatsApp.
          </p>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Funcionalidades Principais</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tudo que você precisa para ter controle total do seu e-commerce em uma única plataforma
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* BI Analítico */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mb-6">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">BI em Tempo Real</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Margem líquida por venda, metas por canal e previsão de cobertura de estoque. 
                Dados atualizados em tempo real para decisões precisas.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  Cálculo automático de margem líquida
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  Metas por canal e SKU
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  Previsão de cobertura de estoque
                </li>
              </ul>
            </div>

            {/* Alertas Automáticos */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6">
                <Bell className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Alertas Inteligentes</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Receba alertas críticos no WhatsApp com contexto completo e ações sugeridas. 
                Nunca mais perca uma oportunidade ou deixe um problema passar.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                  Alertas de ruptura de estoque
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                  Margem baixa detectada
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                  Problemas de fluxo de caixa
                </li>
              </ul>
            </div>

            {/* Gestão via WhatsApp */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Gestão via WhatsApp</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Consulte dados, crie tarefas e gerencie sua equipe diretamente pelo WhatsApp. 
                Seu centro de comando na palma da mão.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  Consultas em linguagem natural
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  Criação de tarefas por comando
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  Acompanhamento de equipe
                </li>
              </ul>
            </div>

            {/* Gestão de Tarefas */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Gestão de Tarefas</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Kanban integrado com insights e calendário comercial. 
                Transforme dados em ações organizadas para sua equipe.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Kanban vinculado a SKUs
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Calendário comercial integrado
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Tarefas automáticas de alertas
                </li>
              </ul>
            </div>

            {/* Módulo Financeiro */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Módulo Financeiro</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Fluxo de caixa projetado, alertas de saldo e integração completa com Bling. 
                Controle financeiro total do seu e-commerce.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  Fluxo de caixa projetado
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  Alertas de saldo negativo
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  Integração com Bling
                </li>
              </ul>
            </div>

            {/* Integrações */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Integrações Nativas</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Conecte todos os seus canais de venda e sistemas em uma única plataforma. 
                Dados unificados de todos os marketplaces.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-violet-500 rounded-full"></div>
                  Bling ERP nativo
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-violet-500 rounded-full"></div>
                  Mercado Livre, Shopee, Amazon
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-violet-500 rounded-full"></div>
                  WhatsApp Business API
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Por que escolher ECOMMIND?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Resultados comprovados que transformam a gestão do seu e-commerce
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">15-30%</h3>
              <p className="text-gray-600">Aumento na margem líquida nos primeiros 6 meses</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">20+ horas</h3>
              <p className="text-gray-600">Economizadas por semana em relatórios manuais</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">90%</h3>
              <p className="text-gray-600">Redução em rupturas de estoque dos produtos top 20</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">99.9%</h3>
              <p className="text-gray-600">Uptime garantido com suporte 24/7</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden" style={{ 
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)'
      }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container-pro py-24 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-8">
            Pronto para transformar seu e-commerce?
          </h2>
          <p className="text-xl text-purple-100 max-w-2xl mx-auto mb-12">
            Conecte Bling, Mercado Livre e Shopee e tenha um centro de comando de verdade.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a className="inline-flex items-center gap-2 px-8 py-4 text-white font-semibold bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
               style={{ borderRadius: 'var(--radius)' }}>
              Começar grátis
            </a>
            <a className="inline-flex items-center gap-2 px-8 py-4 text-purple-100 font-semibold border-2 border-purple-300 hover:bg-purple-300 hover:text-purple-900 transition-all duration-300 cursor-pointer"
               style={{ borderRadius: 'var(--radius)' }}>
              Ver demo (2 min)
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <BrainLogo size="md" variant="white" />
                <h3 className="text-xl font-bold text-white">ECOMMIND</h3>
              </div>
              <p className="text-gray-400">
                Gestão inteligente para e-commerce via WhatsApp
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Produto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/funcionalidades" className="hover:text-purple-400 transition-colors">Funcionalidades</a></li>
                <li><a href="/precos" className="hover:text-purple-400 transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Integrações</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-purple-400 transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-purple-400 transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Documentação</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ECOMMIND. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
