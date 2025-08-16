'use client'

import { useState } from 'react'
import { MoreHorizontal, TrendingUp, Calendar } from 'lucide-react'

interface RevenueData {
  name: string
  revenue: number
  percentage: number
  change: string
  changeType: 'positive' | 'negative'
  color: string
}

interface RevenueChartProps {
  data: RevenueData[]
  title?: string
  period?: string
  totalRevenue?: string
}

export function RevenueChart({ 
  data, 
  title = "Receita por Canal",
  period = "Últimos 30 dias",
  totalRevenue = "R$ 45.280"
}: RevenueChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const periods = [
    { value: '7d', label: '7 dias' },
    { value: '30d', label: '30 dias' },
    { value: '90d', label: '90 dias' },
    { value: '1y', label: '1 ano' }
  ]

  const maxRevenue = Math.max(...data.map(item => item.revenue))

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-heading-3 font-semibold">{title}</h3>
          <p className="text-caption text-text-tertiary mt-1">{period}</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Period Selector */}
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
          
          <button className="p-2 hover:bg-surface-subtle rounded-lg transition-colors">
            <MoreHorizontal className="w-4 h-4 text-text-secondary" />
          </button>
        </div>
      </div>

      {/* Total Revenue */}
      <div className="mb-6 p-4 bg-gradient-to-r from-accent/10 to-accent-secondary/10 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-caption text-text-tertiary mb-1">Receita Total</p>
            <p className="text-heading-1 font-bold text-accent">{totalRevenue}</p>
          </div>
          <div className="flex items-center gap-2 text-success">
            <TrendingUp className="w-5 h-5" />
            <span className="text-body-small font-medium">+12.5%</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-4">
        {data.map((item, index) => (
          <div
            key={item.name}
            className="group cursor-pointer"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Channel Info */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-body font-medium">{item.name}</span>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-body-small font-semibold">
                  R$ {item.revenue.toLocaleString('pt-BR')}
                </span>
                <span className={`text-caption font-medium ${
                  item.changeType === 'positive' ? 'text-success' : 'text-error'
                }`}>
                  {item.changeType === 'positive' ? '+' : ''}{item.change}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative">
              <div className="w-full bg-surface-subtle rounded-full h-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.color,
                    transform: hoveredIndex === index ? 'scaleY(1.2)' : 'scaleY(1)',
                    opacity: hoveredIndex === index ? 0.9 : 0.8
                  }}
                />
              </div>
              
              {/* Percentage Label */}
              <div className="flex justify-between items-center mt-1">
                <span className="text-caption text-text-tertiary">
                  {item.percentage}% do total
                </span>
                
                {hoveredIndex === index && (
                  <span className="text-caption font-medium text-accent">
                    {((item.revenue / maxRevenue) * 100).toFixed(1)}% do maior canal
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-border-light">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-caption text-text-tertiary mb-1">Canais Ativos</p>
            <p className="text-body font-semibold">{data.length}</p>
          </div>
          <div className="text-center">
            <p className="text-caption text-text-tertiary mb-1">Melhor Canal</p>
            <p className="text-body font-semibold">{data[0]?.name}</p>
          </div>
          <div className="text-center">
            <p className="text-caption text-text-tertiary mb-1">Crescimento Médio</p>
            <p className="text-body font-semibold text-success">+8.2%</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex gap-3">
        <button className="btn-secondary flex-1">
          <Calendar className="w-4 h-4 mr-2" />
          Ver Histórico
        </button>
        <button className="btn-primary flex-1">
          <TrendingUp className="w-4 h-4 mr-2" />
          Analisar Tendências
        </button>
      </div>
    </div>
  )
}

// Skeleton para loading
export function RevenueChartSkeleton() {
  return (
    <div className="card p-6 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="w-32 h-6 bg-surface-subtle rounded mb-2"></div>
          <div className="w-20 h-4 bg-surface-subtle rounded"></div>
        </div>
        <div className="w-24 h-8 bg-surface-subtle rounded"></div>
      </div>
      
      <div className="mb-6 p-4 bg-surface-subtle rounded-lg">
        <div className="w-24 h-8 bg-surface-hover rounded"></div>
      </div>
      
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="flex justify-between mb-2">
              <div className="w-24 h-4 bg-surface-subtle rounded"></div>
              <div className="w-16 h-4 bg-surface-subtle rounded"></div>
            </div>
            <div className="w-full h-3 bg-surface-subtle rounded"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
