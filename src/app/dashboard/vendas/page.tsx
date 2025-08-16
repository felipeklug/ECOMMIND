import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function VendasPage() {
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
          <h1 className="text-heading-1 mb-2">Vendas & Metas</h1>
          <p className="text-body-large text-text-secondary">
            Performance de vendas, metas por SKU e análise comparativa por canal
          </p>
        </div>
        <div className="mt-6 sm:mt-0 flex items-center gap-3">
          <button className="btn-secondary">Definir Metas</button>
          <button className="btn-primary">Relatório Vendas</button>
        </div>
      </div>

      {/* Em construção */}
      <div className="card p-12 text-center">
        <div className="w-16 h-16 bg-success-light rounded-xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </div>
        <h3 className="text-heading-2 mb-3">Módulo Vendas & Metas</h3>
        <p className="text-body text-text-secondary mb-6 max-w-md mx-auto">
          Este módulo incluirá comparativo SKU x canal, alertas de produtos sem venda, 
          acompanhamento de metas e insights de discrepância.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button className="btn-secondary">Ver Roadmap</button>
          <button className="btn-primary">Solicitar Acesso Beta</button>
        </div>
      </div>

      {/* Preview das funcionalidades */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="w-12 h-12 bg-accent-light rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h4 className="text-heading-3 mb-2">Comparativo por Canal</h4>
          <p className="text-body-small text-text-secondary">
            Análise detalhada de performance de cada SKU em todos os canais de venda.
          </p>
        </div>

        <div className="card p-6">
          <div className="w-12 h-12 bg-error-light rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h4 className="text-heading-3 mb-2">Alertas de Performance</h4>
          <p className="text-body-small text-text-secondary">
            Identificação automática de produtos sem venda e oportunidades perdidas.
          </p>
        </div>

        <div className="card p-6">
          <div className="w-12 h-12 bg-success-light rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h4 className="text-heading-3 mb-2">Metas Inteligentes</h4>
          <p className="text-body-small text-text-secondary">
            Definição e acompanhamento de metas por SKU com insights de discrepância.
          </p>
        </div>
      </div>
    </div>
  )
}
