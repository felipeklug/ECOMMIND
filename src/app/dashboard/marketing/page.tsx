import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function MarketingPage() {
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
          <h1 className="text-heading-1 mb-2">Marketing & Tráfego Pago</h1>
          <p className="text-body-large text-text-secondary">
            Performance de Ads, ROI por campanha e engajamento nas redes sociais
          </p>
        </div>
        <div className="mt-6 sm:mt-0 flex items-center gap-3">
          <button className="btn-secondary">Conectar Meta Ads</button>
          <button className="btn-primary">Relatório ROI</button>
        </div>
      </div>

      {/* Em construção */}
      <div className="card p-12 text-center">
        <div className="w-16 h-16 bg-accent-light rounded-xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        </div>
        <h3 className="text-heading-2 mb-3">Módulo Marketing & Tráfego Pago</h3>
        <p className="text-body text-text-secondary mb-6 max-w-md mx-auto">
          Este módulo incluirá performance de Meta Ads e Google Ads, cálculo de ROI real, 
          engajamento no Instagram e análise de investimento x retorno.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button className="btn-secondary">Ver Roadmap</button>
          <button className="btn-primary">Solicitar Acesso Beta</button>
        </div>
      </div>

      {/* Preview das funcionalidades */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="w-12 h-12 bg-success-light rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h4 className="text-heading-3 mb-2">ROI Real</h4>
          <p className="text-body-small text-text-secondary">
            Cálculo de ROI baseado no lucro líquido, não apenas na receita gerada.
          </p>
        </div>

        <div className="card p-6">
          <div className="w-12 h-12 bg-info-light rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2" />
            </svg>
          </div>
          <h4 className="text-heading-3 mb-2">Performance Ads</h4>
          <p className="text-body-small text-text-secondary">
            Integração com Meta Ads e Google Ads para análise completa de campanhas.
          </p>
        </div>

        <div className="card p-6">
          <div className="w-12 h-12 bg-warning-light rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h4 className="text-heading-3 mb-2">Engajamento Social</h4>
          <p className="text-body-small text-text-secondary">
            Análise de engajamento no Instagram e correlação com vendas.
          </p>
        </div>
      </div>
    </div>
  )
}
