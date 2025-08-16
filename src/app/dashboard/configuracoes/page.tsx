import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default async function ConfiguracoesPage() {
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
          <h1 className="text-heading-1 mb-2">Configurações</h1>
          <p className="text-body-large text-text-secondary">
            Parâmetros de cálculo, integrações e preferências do sistema
          </p>
        </div>
        <div className="mt-6 sm:mt-0 flex items-center gap-3">
          <button className="btn-secondary">Exportar Configurações</button>
          <button className="btn-primary">Salvar Alterações</button>
        </div>
      </div>

      {/* Configurações Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Parâmetros de Cálculo */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-accent-light rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-heading-3">Parâmetros de Cálculo</h3>
              <p className="text-body-small text-text-secondary">Configurações para cálculos automáticos</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-body-small font-medium mb-2 block">Margem Mínima (%)</label>
              <input 
                type="number" 
                className="input w-full" 
                placeholder="25" 
                defaultValue="25"
              />
            </div>
            
            <div>
              <label className="text-body-small font-medium mb-2 block">Dias para Estoque Crítico</label>
              <input 
                type="number" 
                className="input w-full" 
                placeholder="7" 
                defaultValue="7"
              />
            </div>
            
            <div>
              <label className="text-body-small font-medium mb-2 block">Taxa de Conversão Meta (%)</label>
              <input 
                type="number" 
                className="input w-full" 
                placeholder="3.5" 
                defaultValue="3.5"
              />
            </div>
          </div>
        </div>

        {/* Integrações */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-success-light rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div>
              <h3 className="text-heading-3">Integrações</h3>
              <p className="text-body-small text-text-secondary">Status das conexões com APIs</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-surface-subtle rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">B</span>
                </div>
                <div>
                  <div className="text-body-small font-medium">Bling ERP</div>
                  <div className="text-caption text-text-tertiary">Clique para configurar</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/dashboard/configuracoes/bling'}
              >
                Configurar
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-surface-subtle rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-bold text-yellow-600">ML</span>
                </div>
                <div>
                  <div className="text-body-small font-medium">Mercado Livre</div>
                  <div className="text-caption text-text-tertiary">Última sync: 5 min atrás</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-caption text-success">Conectado</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-surface-subtle rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-bold text-green-600">WA</span>
                </div>
                <div>
                  <div className="text-body-small font-medium">WhatsApp Business</div>
                  <div className="text-caption text-text-tertiary">Configurar webhook</div>
                </div>
              </div>
              <button className="btn-ghost btn-sm">Conectar</button>
            </div>
          </div>
        </div>

        {/* Alertas */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-warning-light rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM16 3h5v5h-5V3zM4 3h6v6H4V3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-heading-3">Configuração de Alertas</h3>
              <p className="text-body-small text-text-secondary">Quando e como receber notificações</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-body-small font-medium">Estoque baixo</div>
                <div className="text-caption text-text-tertiary">Produtos com menos de 7 dias</div>
              </div>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-body-small font-medium">Margem baixa</div>
                <div className="text-caption text-text-tertiary">Produtos abaixo da meta</div>
              </div>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-body-small font-medium">Metas não atingidas</div>
                <div className="text-caption text-text-tertiary">Alertas diários de performance</div>
              </div>
              <label className="switch">
                <input type="checkbox" />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Preferências */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-info-light rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-heading-3">Preferências</h3>
              <p className="text-body-small text-text-secondary">Configurações de interface e comportamento</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-body-small font-medium mb-2 block">Tema</label>
              <select className="input w-full">
                <option>Claro</option>
                <option>Escuro</option>
                <option>Automático</option>
              </select>
            </div>

            <div>
              <label className="text-body-small font-medium mb-2 block">Fuso Horário</label>
              <select className="input w-full">
                <option>America/Sao_Paulo</option>
                <option>America/New_York</option>
                <option>Europe/London</option>
              </select>
            </div>

            <div>
              <label className="text-body-small font-medium mb-2 block">Moeda</label>
              <select className="input w-full">
                <option>BRL - Real Brasileiro</option>
                <option>USD - Dólar Americano</option>
                <option>EUR - Euro</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
