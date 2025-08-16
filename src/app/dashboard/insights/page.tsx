import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function InsightsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect('/login')
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-heading-1 mb-2">IA Insights & Consultoria</h1>
          <p className="text-body-large text-text-secondary">
            Consultoria automática com agentes especializados em finanças, vendas, estoque e marketing
          </p>
        </div>
        <div className="mt-6 sm:mt-0 flex items-center gap-3">
          <button className="btn-secondary">Configurar Agentes</button>
          <button className="btn-primary">Nova Consulta</button>
        </div>
      </div>

      {/* Em construção */}
      <div className="card p-12 text-center">
        <div className="w-16 h-16 bg-info-light rounded-xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h3 className="text-heading-2 mb-3">IA Multi-Agente</h3>
        <p className="text-body text-text-secondary mb-6 max-w-md mx-auto">
          Sistema de IA com agentes especializados que analisam seus dados e fornecem 
          insights personalizados para otimizar seu e-commerce.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button className="btn-secondary">Ver Roadmap</button>
          <button className="btn-primary">Solicitar Acesso Beta</button>
        </div>
      </div>

      {/* Agentes IA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="w-12 h-12 bg-success-light rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h4 className="text-heading-3 mb-2">Agente Financeiro</h4>
          <p className="text-body-small text-text-secondary mb-4">
            Especialista em análise financeira, DRE e otimização de custos.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span className="text-caption text-success">Ativo</span>
          </div>
        </div>

        <div className="card p-6">
          <div className="w-12 h-12 bg-accent-light rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h4 className="text-heading-3 mb-2">Agente de Vendas</h4>
          <p className="text-body-small text-text-secondary mb-4">
            Especialista em performance de vendas, metas e oportunidades.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span className="text-caption text-success">Ativo</span>
          </div>
        </div>

        <div className="card p-6">
          <div className="w-12 h-12 bg-warning-light rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 21V9l3-2 3 2v12" />
            </svg>
          </div>
          <h4 className="text-heading-3 mb-2">Agente de Estoque</h4>
          <p className="text-body-small text-text-secondary mb-4">
            Especialista em gestão de estoque e previsão de demanda.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span className="text-caption text-success">Ativo</span>
          </div>
        </div>

        <div className="card p-6">
          <div className="w-12 h-12 bg-error-light rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <h4 className="text-heading-3 mb-2">Agente de Marketing</h4>
          <p className="text-body-small text-text-secondary mb-4">
            Especialista em tráfego pago, ROI e estratégias de marketing.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-warning rounded-full"></div>
            <span className="text-caption text-warning">Em desenvolvimento</span>
          </div>
        </div>
      </div>
    </div>
  )
}
