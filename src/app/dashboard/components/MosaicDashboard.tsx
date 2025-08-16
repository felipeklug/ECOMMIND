'use client'

import { 
  DollarSign, 
  TrendingUp, 
  Package, 
  ShoppingCart,
  Users,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { MosaicCard } from '@/components/dashboard/MosaicCard'

interface MosaicDashboardProps {
  user: User
}

export function MosaicDashboard({ user }: MosaicDashboardProps) {
  // Mock data - será substituído por dados reais
  const kpis = [
    {
      id: 'revenue',
      title: 'Receita Total',
      value: 'R$ 145.280',
      change: '+18.5%',
      changeType: 'positive' as const,
      icon: DollarSign,
      description: 'Últimos 30 dias'
    },
    {
      id: 'orders',
      title: 'Pedidos',
      value: '1.247',
      change: '+12.3%',
      changeType: 'positive' as const,
      icon: ShoppingCart,
      description: 'Este mês'
    },
    {
      id: 'conversion',
      title: 'Taxa de Conversão',
      value: '3.2%',
      change: '+0.8%',
      changeType: 'positive' as const,
      icon: Target,
      description: 'Média dos canais'
    },
    {
      id: 'customers',
      title: 'Novos Clientes',
      value: '892',
      change: '+24.1%',
      changeType: 'positive' as const,
      icon: Users,
      description: 'Este mês'
    }
  ]

  const channels = [
    {
      name: 'Mercado Livre',
      revenue: 84250,
      orders: 156,
      conversion: 4.2,
      change: '+15.3%',
      changeType: 'positive' as const
    },
    {
      name: 'Shopee',
      revenue: 38920,
      orders: 89,
      conversion: 2.8,
      change: '+8.7%',
      changeType: 'positive' as const
    },
    {
      name: 'Site Próprio',
      revenue: 22110,
      orders: 34,
      conversion: 5.1,
      change: '+32.1%',
      changeType: 'positive' as const
    }
  ]

  const alerts = [
    {
      id: 1,
      title: 'Estoque Baixo',
      message: 'Smartphone XYZ com apenas 3 unidades',
      type: 'warning',
      time: '5 min atrás'
    },
    {
      id: 2,
      title: 'Meta Atingida',
      message: 'Vendas do mês superaram a meta em 15%',
      type: 'success',
      time: '1h atrás'
    },
    {
      id: 3,
      title: 'Margem Baixa',
      message: 'Produto ABC com margem de apenas 8%',
      type: 'warning',
      time: '2h atrás'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-text mb-2">
          Bem-vindo de volta, {user.user_metadata?.full_name || 'Usuário'}!
        </h1>
        <p className="text-text-secondary">
          Aqui está um resumo do seu negócio hoje.
        </p>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <MosaicCard
            key={kpi.id}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            changeType={kpi.changeType}
            icon={kpi.icon}
            description={kpi.description}
            onClick={() => console.log('KPI clicked:', kpi.id)}
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue by Channel */}
        <div className="lg:col-span-2">
          <div className="card-mosaic p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-text">Receita por Canal</h3>
              <button className="text-sm text-brand-500 hover:text-brand-600 font-medium">
                Ver detalhes
              </button>
            </div>
            
            <div className="space-y-4">
              {channels.map((channel, index) => (
                <div key={channel.name} className="flex items-center justify-between p-4 bg-bg rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-brand-500' : 
                      index === 1 ? 'bg-warning' : 'bg-info'
                    }`} />
                    <div>
                      <div className="font-medium text-text">{channel.name}</div>
                      <div className="text-sm text-muted">{channel.orders} pedidos</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold text-text">
                      R$ {channel.revenue.toLocaleString('pt-BR')}
                    </div>
                    <div className={`text-sm flex items-center gap-1 ${
                      channel.changeType === 'positive' ? 'text-success' : 'text-danger'
                    }`}>
                      {channel.changeType === 'positive' ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      {channel.change}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="card-mosaic p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text">Alertas</h3>
            <span className="px-2 py-1 bg-warning-light text-warning text-xs font-medium rounded-full">
              {alerts.length}
            </span>
          </div>

          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 bg-bg rounded-lg">
                <div className={`p-1 rounded-full ${
                  alert.type === 'warning' ? 'bg-warning-light' :
                  alert.type === 'success' ? 'bg-success-light' : 'bg-info-light'
                }`}>
                  {alert.type === 'warning' ? (
                    <AlertTriangle className="w-3 h-3 text-warning" />
                  ) : alert.type === 'success' ? (
                    <CheckCircle className="w-3 h-3 text-success" />
                  ) : (
                    <Clock className="w-3 h-3 text-info" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-text">{alert.title}</h4>
                  <p className="text-sm text-muted mt-1">{alert.message}</p>
                  <span className="text-xs text-muted">{alert.time}</span>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 text-sm text-brand-500 hover:text-brand-600 font-medium">
            Ver todos os alertas
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-mosaic p-6 text-center">
          <Package className="w-8 h-8 text-brand-500 mx-auto mb-3" />
          <h3 className="font-semibold text-text mb-2">Gerenciar Estoque</h3>
          <p className="text-sm text-muted mb-4">Visualize e atualize seus produtos</p>
          <button className="w-full bg-brand-500 text-white py-2 px-4 rounded-lg hover:bg-brand-600 transition-colors">
            Acessar Estoque
          </button>
        </div>

        <div className="card-mosaic p-6 text-center">
          <TrendingUp className="w-8 h-8 text-success mx-auto mb-3" />
          <h3 className="font-semibold text-text mb-2">Relatórios</h3>
          <p className="text-sm text-muted mb-4">Análises detalhadas de vendas</p>
          <button className="w-full bg-success text-white py-2 px-4 rounded-lg hover:bg-success/90 transition-colors">
            Ver Relatórios
          </button>
        </div>

        <div className="card-mosaic p-6 text-center">
          <Target className="w-8 h-8 text-info mx-auto mb-3" />
          <h3 className="font-semibold text-text mb-2">Definir Metas</h3>
          <p className="text-sm text-muted mb-4">Configure objetivos mensais</p>
          <button className="w-full bg-info text-white py-2 px-4 rounded-lg hover:bg-info/90 transition-colors">
            Configurar Metas
          </button>
        </div>
      </div>
    </div>
  )
}
