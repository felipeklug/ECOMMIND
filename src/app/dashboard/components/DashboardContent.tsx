'use client'

import React, { useState, useEffect } from 'react'
import {
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
  MessageCircle,
  Plus,
  PieChart,
  Target,
  BarChart3,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  TrendingDown,
  Clock,
  Bell
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'

interface DashboardContentProps {
  user: User
}

// Mock data - será substituído por dados reais das APIs
const dashboardData = {
  kpis: [
    {
      id: 'revenue',
      title: 'Receita Hoje',
      value: 'R$ 12.450',
      change: '+15%',
      changeType: 'positive' as const,
      icon: DollarSign,
      period: 'vs. ontem'
    },
    {
      id: 'margin',
      title: 'Margem Média',
      value: '23.5%',
      change: '+2.1%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      period: 'vs. meta'
    },
    {
      id: 'orders',
      title: 'Pedidos',
      value: '47',
      change: '-8%',
      changeType: 'negative' as const,
      icon: ShoppingCart,
      period: 'vs. ontem'
    },
    {
      id: 'inventory',
      title: 'Produtos Críticos',
      value: '3',
      change: '+2',
      changeType: 'negative' as const,
      icon: Package,
      period: 'estoque baixo'
    }
  ],
  channels: [
    {
      name: 'Mercado Livre',
      revenue: 7200,
      percentage: 58,
      change: '+12%',
      changeType: 'positive' as const,
      color: '#FFE600'
    },
    {
      name: 'Shopee',
      revenue: 3100,
      percentage: 25,
      change: '+8%',
      changeType: 'positive' as const,
      color: '#EE4D2D'
    },
    {
      name: 'Site Próprio',
      revenue: 2150,
      percentage: 17,
      change: '-3%',
      changeType: 'negative' as const,
      color: '#8b5cf6'
    }
  ],
  alerts: [
    {
      id: '1',
      type: 'warning' as const,
      title: 'Estoque Baixo',
      message: 'Smartphone XYZ com apenas 3 unidades',
      priority: 'high' as const,
      time: '5 min atrás',
      action: 'Repor Estoque',
      category: 'stock' as const,
      isRead: false,
      data: {
        produto: 'Smartphone XYZ',
        estoque: '3 unidades',
        vendas_7d: '12 unidades'
      }
    },
    {
      id: '2',
      type: 'error' as const,
      title: 'Margem Crítica',
      message: 'Produto ABC com margem de 8% (meta: 25%)',
      priority: 'high' as const,
      time: '12 min atrás',
      action: 'Ajustar Preço',
      category: 'margin' as const,
      isRead: false,
      data: {
        produto: 'Produto ABC',
        margem_atual: '8%',
        margem_meta: '25%'
      }
    },
    {
      id: '3',
      type: 'info' as const,
      title: 'Sincronização',
      message: 'Amazon: próxima sync em 45 minutos',
      priority: 'low' as const,
      time: '1h atrás',
      action: 'Ver Status',
      category: 'system' as const,
      isRead: true,
      data: {
        canal: 'Amazon',
        proxima_sync: '45 minutos',
        status: 'OK'
      }
    }
  ]
}

export default function DashboardContent({ user }: DashboardContentProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  // Handlers para interações
  const handleMetricClick = (metricId: string) => {
    console.log('Metric clicked:', metricId)
    // Aqui você pode navegar para a página específica da métrica
    switch (metricId) {
      case 'revenue':
        window.location.href = '/dashboard/financeiro'
        break
      case 'orders':
        window.location.href = '/dashboard/vendas'
        break
      case 'inventory':
        window.location.href = '/dashboard/estoque'
        break
      default:
        break
    }
  }

  const handleAlertAction = (alertId: string, action: string) => {
    console.log('Alert action:', alertId, action)
    // Implementar ações específicas dos alertas
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      alert(`Ação "${action}" executada para o alerta ${alertId}`)
    }, 1000)
  }

  const handleMarkAsRead = (alertId: string) => {
    console.log('Mark as read:', alertId)
    // Implementar marcação como lido
  }

  const handleDismissAlert = (alertId: string) => {
    console.log('Dismiss alert:', alertId)
    // Implementar remoção do alerta
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return AlertTriangle
      case 'error': return TrendingDown
      case 'info': return Clock
      default: return Bell
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning': return 'text-warning'
      case 'error': return 'text-error'
      case 'info': return 'text-accent'
      default: return 'text-text-secondary'
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-heading-1 mb-2">
            {getGreeting()}, {user.user_metadata?.full_name?.split(' ')[0] || 'Usuário'}! 👋
          </h1>
          <p className="text-body-large text-text-secondary">
            Aqui está um resumo do seu e-commerce hoje, {currentTime.toLocaleDateString('pt-BR')}
          </p>
        </div>
        <div className="mt-6 sm:mt-0 flex items-center gap-3">
          <button className="btn-secondary">
            <MessageCircle className="w-4 h-4 mr-2" />
            WhatsApp
          </button>
          <button className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Nova Tarefa
          </button>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardData.kpis.map((kpi) => (
          <div key={kpi.id} className="card p-6 cursor-pointer hover:shadow-lg transition-all duration-200" onClick={() => handleMetricClick(kpi.id)}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-surface-subtle rounded-lg">
                <kpi.icon className="w-5 h-5 text-text-secondary" />
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-caption font-medium ${
                kpi.changeType === 'positive'
                  ? 'bg-success-light text-success'
                  : 'bg-error-light text-error'
              }`}>
                {kpi.changeType === 'positive' ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {kpi.change}
              </div>
            </div>

            <div>
              <h3 className="text-heading-2 font-semibold mb-1">{kpi.value}</h3>
              <p className="text-body-small">{kpi.title}</p>
              <p className="text-caption mt-1">{kpi.period}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue by Channel */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-heading-3">Receita por Canal</h3>
          <button className="btn-ghost btn-sm">Ver detalhes</button>
        </div>

        <div className="space-y-4">
          {dashboardData.channels.map((channel) => (
            <div key={channel.name} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-body font-medium">{channel.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-body-small font-medium">R$ {channel.revenue.toLocaleString('pt-BR')}</span>
                    <span className={`text-caption font-medium ${
                      channel.changeType === 'positive' ? 'text-success' : 'text-error'
                    }`}>
                      {channel.change}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-surface-subtle rounded-full h-2">
                  <div
                    className="bg-accent h-2 rounded-full transition-all duration-500"
                    style={{ width: `${channel.percentage}%` }}
                  ></div>
                </div>

                <div className="flex justify-between mt-1">
                  <span className="text-caption">{channel.percentage}% do total</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Alerts */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-heading-3">Alertas</h3>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-error-light text-error text-caption font-medium rounded-full">
                2 críticos
              </span>
              <button className="btn-ghost btn-sm">Ver todos</button>
            </div>
          </div>

          <div className="space-y-4">
            {dashboardData.alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-4 bg-surface-subtle rounded-lg border border-border-light hover:border-border transition-colors"
              >
                <div className={`p-1.5 rounded-lg bg-surface ${getAlertColor(alert.type)}`}>
                  {React.createElement(getAlertIcon(alert.type), { className: "w-4 h-4" })}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="text-body font-medium mb-1">{alert.title}</h4>
                      <p className="text-body-small text-text-secondary mb-2">{alert.message}</p>
                      <p className="text-caption text-text-tertiary">{alert.time}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <button
                      className="btn-ghost btn-sm flex items-center gap-1"
                      onClick={() => handleAlertAction(alert.id, alert.action)}
                    >
                      <span>{alert.action}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>

                    {alert.priority === 'high' && (
                      <span className="px-2 py-0.5 bg-error-light text-error text-caption font-medium rounded-full">
                        Urgente
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-heading-3">Ações Rápidas</h3>
            <button className="btn-ghost btn-sm">
              <Settings className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 p-3 text-left bg-surface-subtle rounded-lg hover:bg-surface-hover transition-colors">
              <div className="w-10 h-10 bg-accent-light rounded-lg flex items-center justify-center">
                <PieChart className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <div className="text-body font-medium">Relatório Financeiro</div>
                <div className="text-caption text-text-tertiary">DRE por canal</div>
              </div>
            </button>

            <button className="w-full flex items-center gap-3 p-3 text-left bg-surface-subtle rounded-lg hover:bg-surface-hover transition-colors">
              <div className="w-10 h-10 bg-success-light rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1">
                <div className="text-body font-medium">Metas & Performance</div>
                <div className="text-caption text-text-tertiary">Acompanhar vendas</div>
              </div>
            </button>

            <button className="w-full flex items-center gap-3 p-3 text-left bg-surface-subtle rounded-lg hover:bg-surface-hover transition-colors">
              <div className="w-10 h-10 bg-warning-light rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-warning" />
              </div>
              <div className="flex-1">
                <div className="text-body font-medium">Gestão de Estoque</div>
                <div className="text-caption text-text-tertiary">Produtos críticos</div>
              </div>
            </button>

            <button className="w-full flex items-center gap-3 p-3 text-left bg-surface-subtle rounded-lg hover:bg-surface-hover transition-colors">
              <div className="w-10 h-10 bg-info-light rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-info" />
              </div>
              <div className="flex-1">
                <div className="text-body font-medium">IA Insights</div>
                <div className="text-caption text-text-tertiary">Consultoria automática</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
