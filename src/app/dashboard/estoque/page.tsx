import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function EstoquePage() {
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
          <h1 className="text-heading-1 mb-2">Estoque & Operações</h1>
          <p className="text-body-large text-text-secondary">
            Gestão inteligente de estoque com previsão de ruptura e classificação ABC
          </p>
        </div>
        <div className="mt-6 sm:mt-0 flex items-center gap-3">
          <button className="btn-secondary">Planejar Envios</button>
          <button className="btn-primary">Relatório ABC</button>
        </div>
      </div>

      {/* Em construção */}
      <div className="card p-12 text-center">
        <div className="w-16 h-16 bg-warning-light rounded-xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 21V9l3-2 3 2v12" />
          </svg>
        </div>
        <h3 className="text-heading-2 mb-3">Módulo Estoque & Operações</h3>
        <p className="text-body text-text-secondary mb-6 max-w-md mx-auto">
          Este módulo incluirá estoque ERP + fulfillment, previsão de ruptura, 
          planejamento de envios e classificação ABC de produtos.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button className="btn-secondary">Ver Roadmap</button>
          <button className="btn-primary">Solicitar Acesso Beta</button>
        </div>
      </div>

      {/* Preview das funcionalidades */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="w-12 h-12 bg-error-light rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h4 className="text-heading-3 mb-2">Previsão de Ruptura</h4>
          <p className="text-body-small text-text-secondary">
            Algoritmos preditivos para identificar produtos com risco de ruptura de estoque.
          </p>
        </div>

        <div className="card p-6">
          <div className="w-12 h-12 bg-info-light rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h4 className="text-heading-3 mb-2">Classificação ABC</h4>
          <p className="text-body-small text-text-secondary">
            Análise automática de produtos por importância e giro de estoque.
          </p>
        </div>

        <div className="card p-6">
          <div className="w-12 h-12 bg-success-light rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h4 className="text-heading-3 mb-2">Planejamento de Envios</h4>
          <p className="text-body-small text-text-secondary">
            Otimização de envios para fulfillment e gestão de prazos de entrega.
          </p>
        </div>
      </div>
    </div>
  )
}
