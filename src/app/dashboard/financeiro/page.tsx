'use client'

import { useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Download,
  Settings,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { MetricCard } from '@/components/dashboard/MetricCard'

export default function FinanceiroPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedChannel, setSelectedChannel] = useState('all')

  // Dados financeiros mock
  const financialData = {
    overview: [
      {
        id: 'revenue',
        title: 'Receita Total',
        value: 'R$ 145.280',
        change: '+18.5%',
        changeType: 'positive' as const,
        icon: DollarSign,
        period: 'últimos 30 dias'
      },
      {
        id: 'profit',
        title: 'Lucro Líquido',
        value: 'R$ 34.125',
        change: '+22.1%',
        changeType: 'positive' as const,
        icon: TrendingUp,
        period: '23.5% margem'
      },
      {
        id: 'costs',
        title: 'Custos Totais',
        value: 'R$ 87.450',
        change: '+12.3%',
        changeType: 'negative' as const,
        icon: TrendingDown,
        period: '60.2% da receita'
      },
      {
        id: 'margin',
        title: 'Margem Média',
        value: '23.5%',
        change: '+2.8%',
        changeType: 'positive' as const,
        icon: PieChart,
        period: 'acima da meta'
      }
    ],
    channels: [
      {
        name: 'Mercado Livre',
        revenue: 84250,
        costs: 52340,
        profit: 31910,
        margin: 37.9,
        orders: 156,
        avgTicket: 540.06
      },
      {
        name: 'Shopee',
        revenue: 38920,
        costs: 24580,
        profit: 14340,
        margin: 36.8,
        orders: 89,
        avgTicket: 437.30
      },
      {
        name: 'Site Próprio',
        revenue: 22110,
        costs: 10530,
        profit: 11580,
        margin: 52.4,
        orders: 34,
        avgTicket: 650.29
      }
    ]
  }

  const periods = [
    { value: '7d', label: '7 dias' },
    { value: '30d', label: '30 dias' },
    { value: '90d', label: '90 dias' },
    { value: '1y', label: '1 ano' }
  ]

  const channels = [
    { value: 'all', label: 'Todos os Canais' },
    { value: 'ml', label: 'Mercado Livre' },
    { value: 'shopee', label: 'Shopee' },
    { value: 'site', label: 'Site Próprio' }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-heading-1 mb-2">Financeiro & DRE</h1>
          <p className="text-body-large text-text-secondary">
            Análise financeira completa por canal com DRE automático
          </p>
        </div>
        <div className="mt-6 sm:mt-0 flex items-center gap-3">
          <button className="btn-secondary">
            <Download className="w-4 h-4 mr-2" />
            Exportar DRE
          </button>
          <button className="btn-primary">
            <Settings className="w-4 h-4 mr-2" />
            Configurar Custos
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-text-secondary" />
          <span className="text-body-small font-medium">Período:</span>
          <div className="flex items-center bg-surface-subtle rounded-lg p-1">
            {periods.map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`px-3 py-1 text-caption font-medium rounded-md transition-all ${
                  selectedPeriod === period.value
                    ? 'bg-accent text-white'
                    : 'text-text-secondary hover:text-text'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-text-secondary" />
          <span className="text-body-small font-medium">Canal:</span>
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="input py-1 px-3 text-caption"
          >
            {channels.map((channel) => (
              <option key={channel.value} value={channel.value}>
                {channel.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {financialData.overview.map((metric) => (
          <MetricCard
            key={metric.id}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            changeType={metric.changeType}
            icon={metric.icon}
            period={metric.period}
            onClick={() => console.log('Metric clicked:', metric.id)}
          />
        ))}
      </div>

      {/* DRE por Canal */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-heading-3">DRE por Canal</h3>
          <button className="btn-ghost btn-sm">Ver Detalhes</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-light">
                <th className="text-left py-3 px-4 text-body-small font-semibold text-text-secondary">Canal</th>
                <th className="text-right py-3 px-4 text-body-small font-semibold text-text-secondary">Receita</th>
                <th className="text-right py-3 px-4 text-body-small font-semibold text-text-secondary">Custos</th>
                <th className="text-right py-3 px-4 text-body-small font-semibold text-text-secondary">Lucro</th>
                <th className="text-right py-3 px-4 text-body-small font-semibold text-text-secondary">Margem</th>
                <th className="text-right py-3 px-4 text-body-small font-semibold text-text-secondary">Pedidos</th>
                <th className="text-right py-3 px-4 text-body-small font-semibold text-text-secondary">Ticket Médio</th>
              </tr>
            </thead>
            <tbody>
              {financialData.channels.map((channel, index) => (
                <tr key={channel.name} className="border-b border-border-light hover:bg-surface-subtle transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-yellow-400' :
                        index === 1 ? 'bg-orange-500' : 'bg-accent'
                      }`} />
                      <span className="text-body font-medium">{channel.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right text-body font-semibold">
                    R$ {channel.revenue.toLocaleString('pt-BR')}
                  </td>
                  <td className="py-4 px-4 text-right text-body text-error">
                    R$ {channel.costs.toLocaleString('pt-BR')}
                  </td>
                  <td className="py-4 px-4 text-right text-body font-semibold text-success">
                    R$ {channel.profit.toLocaleString('pt-BR')}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className={`px-2 py-1 rounded-full text-caption font-medium ${
                      channel.margin > 30 ? 'bg-success-light text-success' :
                      channel.margin > 20 ? 'bg-warning-light text-warning' :
                      'bg-error-light text-error'
                    }`}>
                      {channel.margin.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right text-body">
                    {channel.orders}
                  </td>
                  <td className="py-4 px-4 text-right text-body font-medium">
                    R$ {channel.avgTicket.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Análise de Tendências */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card p-6">
          <h3 className="text-heading-3 mb-4">Evolução da Margem</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-body-small">Este mês</span>
              <div className="flex items-center gap-2">
                <span className="text-body font-semibold">23.5%</span>
                <ArrowUpRight className="w-4 h-4 text-success" />
                <span className="text-caption text-success">+2.8%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-small">Mês anterior</span>
              <div className="flex items-center gap-2">
                <span className="text-body font-semibold">20.7%</span>
                <ArrowUpRight className="w-4 h-4 text-success" />
                <span className="text-caption text-success">+1.2%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-small">Há 3 meses</span>
              <div className="flex items-center gap-2">
                <span className="text-body font-semibold">19.5%</span>
                <ArrowDownRight className="w-4 h-4 text-error" />
                <span className="text-caption text-error">-0.8%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-heading-3 mb-4">Principais Custos</h3>
          <div className="space-y-3">
            {[
              { name: 'Custo do Produto', value: 45.2, color: 'bg-error' },
              { name: 'Taxas de Marketplace', value: 12.8, color: 'bg-warning' },
              { name: 'Frete', value: 8.5, color: 'bg-info' },
              { name: 'Impostos', value: 6.2, color: 'bg-accent' },
              { name: 'Outros', value: 3.1, color: 'bg-success' }
            ].map((cost) => (
              <div key={cost.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${cost.color}`} />
                  <span className="text-body-small">{cost.name}</span>
                </div>
                <span className="text-body-small font-medium">{cost.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
