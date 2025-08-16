import { Check, Star, Zap } from 'lucide-react'
import { BrainLogo } from '@/components/shared/brain-logo'

export default function PrecosPage() {
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
              <a href="/funcionalidades" className="text-neutral-600 hover:text-accent-500 transition-colors font-medium text-lg">
                Funcionalidades
              </a>
              <a href="/precos" className="text-accent-500 font-medium text-lg">
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
        minHeight: '50vh'
      }}>
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-violet-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container-pro pt-20 pb-16 relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-8">
            Planos que <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-400">crescem</span> com você
          </h1>
          <p className="text-xl text-purple-100 max-w-3xl mx-auto leading-relaxed">
            Escolha o plano ideal para transformar seu e-commerce. Todos incluem acesso completo às funcionalidades.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            
            {/* Plano Mensal */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 relative">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Mensal</h3>
                <p className="text-gray-600 mb-6">Flexibilidade total para testar</p>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">R$ 129</span>
                  <span className="text-gray-600 ml-2">/mês</span>
                </div>
                <a className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-purple-600 font-semibold border-2 border-purple-600 hover:bg-purple-600 hover:text-white transition-all duration-300 cursor-pointer"
                   style={{ borderRadius: 'var(--radius)' }}>
                  Começar agora
                </a>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">BI em tempo real completo</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Alertas automáticos via WhatsApp</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Gestão de tarefas integrada</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Integrações nativas</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Suporte por WhatsApp</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Relatórios personalizados</span>
                </div>
              </div>
            </div>

            {/* Plano Trimestral - Mais Popular */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-purple-500 p-8 relative transform scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-purple-600 to-violet-600 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Mais Popular
                </div>
              </div>
              
              <div className="text-center mb-8 mt-4">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Trimestral</h3>
                <p className="text-gray-600 mb-6">Economia de 23% no valor mensal</p>
                <div className="mb-2">
                  <span className="text-5xl font-bold text-purple-600">R$ 99</span>
                  <span className="text-gray-600 ml-2">/mês</span>
                </div>
                <div className="mb-6">
                  <span className="text-sm text-gray-500 line-through">R$ 129/mês</span>
                  <span className="text-sm text-green-600 ml-2 font-semibold">Economize R$ 90</span>
                </div>
                <a className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-white font-semibold bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                   style={{ borderRadius: 'var(--radius)' }}>
                  Começar agora
                </a>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">BI em tempo real completo</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Alertas automáticos via WhatsApp</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Gestão de tarefas integrada</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Integrações nativas</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Suporte prioritário</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Relatórios personalizados</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-700 font-semibold">Setup personalizado incluído</span>
                </div>
              </div>
            </div>

            {/* Plano Semestral */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 relative">
              <div className="absolute -top-3 right-4">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Melhor Valor
                </div>
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Semestral</h3>
                <p className="text-gray-600 mb-6">Máxima economia para crescer</p>
                <div className="mb-2">
                  <span className="text-5xl font-bold text-green-600">R$ 69</span>
                  <span className="text-gray-600 ml-2">/mês</span>
                </div>
                <div className="mb-6">
                  <span className="text-sm text-gray-500 line-through">R$ 129/mês</span>
                  <span className="text-sm text-green-600 ml-2 font-semibold">Economize R$ 360</span>
                </div>
                <a className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-green-600 font-semibold border-2 border-green-600 hover:bg-green-600 hover:text-white transition-all duration-300 cursor-pointer"
                   style={{ borderRadius: 'var(--radius)' }}>
                  Começar agora
                </a>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">BI em tempo real completo</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Alertas automáticos via WhatsApp</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Gestão de tarefas integrada</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Integrações nativas</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Suporte VIP</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Relatórios personalizados</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700 font-semibold">Setup + treinamento incluído</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700 font-semibold">Consultoria estratégica mensal</span>
                </div>
              </div>
            </div>
          </div>

          {/* Garantia */}
          <div className="text-center mt-16">
            <div className="inline-flex items-center gap-3 bg-green-50 border border-green-200 rounded-full px-6 py-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <span className="text-green-800 font-semibold">Garantia de 30 dias ou seu dinheiro de volta</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Perguntas Frequentes</h2>
            <p className="text-xl text-gray-600">Tire suas dúvidas sobre os planos ECOMMIND</p>
          </div>

          <div className="space-y-8">
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Posso cancelar a qualquer momento?</h3>
              <p className="text-gray-600">Sim! Você pode cancelar seu plano a qualquer momento. Não há multas ou taxas de cancelamento.</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Como funciona a integração com o Bling?</h3>
              <p className="text-gray-600">A integração é nativa e automática. Basta fornecer suas credenciais do Bling e em poucos minutos todos os dados estarão sincronizados.</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Há limite de usuários ou transações?</h3>
              <p className="text-gray-600">Não! Todos os planos incluem usuários e transações ilimitadas. Você paga apenas pela funcionalidade, não pelo volume.</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Como funciona o suporte?</h3>
              <p className="text-gray-600">Oferecemos suporte via WhatsApp, email e chat. Planos trimestrais e semestrais têm prioridade no atendimento.</p>
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
            Comece sua transformação hoje
          </h2>
          <p className="text-xl text-purple-100 max-w-2xl mx-auto mb-12">
            Junte-se a centenas de e-commerces que já aumentaram sua margem com ECOMMIND
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a className="inline-flex items-center gap-2 px-8 py-4 text-white font-semibold bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
               style={{ borderRadius: 'var(--radius)' }}>
              Começar grátis por 7 dias
            </a>
            <a className="inline-flex items-center gap-2 px-8 py-4 text-purple-100 font-semibold border-2 border-purple-300 hover:bg-purple-300 hover:text-purple-900 transition-all duration-300 cursor-pointer"
               style={{ borderRadius: 'var(--radius)' }}>
              Falar com especialista
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
