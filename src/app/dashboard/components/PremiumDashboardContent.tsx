'use client'

import React, { memo } from 'react'
import { 
  DollarSign, 
  TrendingUp, 
  Package, 
  ShoppingCart,
  Users,
  Target,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { PremiumCard, MetricCard, StatsCard } from '@/components/dashboard/PremiumCard'

export const PremiumDashboardContent = memo(() => {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-display-lg text-primary mb-2">
          Bom dia! 👋
        </h1>
        <p className="text-body-lg text-secondary">
          Aqui está um resumo do seu e-commerce hoje
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PremiumCard
          title="Vendas Hoje"
          value="R$ 12.450"
          subtitle="Meta: R$ 15.000"
          icon={DollarSign}
          trend={{
            value: 15,
            label: "vs ontem",
            isPositive: true
          }}
          variant="gradient"
        />
        
        <MetricCard
          title="Pedidos"
          value="47"
          change={{
            value: 8,
            period: "vs ontem"
          }}
          icon={ShoppingCart}
          color="success"
        />
        
        <MetricCard
          title="Ticket Médio"
          value="R$ 264,89"
          change={{
            value: -3,
            period: "vs ontem"
          }}
          icon={TrendingUp}
          color="warning"
        />
        
        <MetricCard
          title="Conversão"
          value="3.2%"
          change={{
            value: 12,
            period: "vs semana"
          }}
          icon={Target}
          color="info"
        />
      </div>

      {/* Performance por Canal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PremiumCard
          title="Performance por Canal"
          value=""
          variant="elevated"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-brand-500 rounded-full"></div>
                <span className="text-body-sm font-medium text-primary">Mercado Livre</span>
              </div>
              <div className="text-right">
                <div className="text-body-sm font-bold text-primary">R$ 7.200</div>
                <div className="text-caption text-success-500">+18%</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
                <span className="text-body-sm font-medium text-primary">Shopee</span>
              </div>
              <div className="text-right">
                <div className="text-body-sm font-bold text-primary">R$ 3.100</div>
                <div className="text-caption text-success-500">+12%</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-info-500 rounded-full"></div>
                <span className="text-body-sm font-medium text-primary">Site Próprio</span>
              </div>
              <div className="text-right">
                <div className="text-body-sm font-bold text-primary">R$ 2.150</div>
                <div className="text-caption text-danger-500">-5%</div>
              </div>
            </div>
          </div>
        </PremiumCard>

        <StatsCard
          title="Top Produtos"
          stats={[
            { label: "Smartphone XYZ", value: "R$ 2.890", trend: 25 },
            { label: "Fone Bluetooth", value: "R$ 1.450", trend: 12 },
            { label: "Carregador Rápido", value: "R$ 890", trend: -8 },
            { label: "Capa Proteção", value: "R$ 650", trend: 5 },
            { label: "Película Vidro", value: "R$ 420", trend: 15 }
          ]}
        />
      </div>

      {/* Alertas e Tarefas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PremiumCard
          title="Alertas Críticos"
          value=""
          variant="elevated"
        >
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-danger-50 rounded-lg border border-danger-200">
              <AlertTriangle className="w-5 h-5 text-danger-500 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-body-sm font-medium text-danger-700">Estoque Baixo</h4>
                <p className="text-body-sm text-danger-600">Smartphone XYZ com apenas 3 unidades</p>
                <span className="text-caption text-danger-500">Cobertura: 2 dias</span>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-warning-50 rounded-lg border border-warning-200">
              <AlertTriangle className="w-5 h-5 text-warning-500 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-body-sm font-medium text-warning-700">Margem Baixa</h4>
                <p className="text-body-sm text-warning-600">Fone Bluetooth com margem de 8%</p>
                <span className="text-caption text-warning-500">Meta: 25%</span>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-info-50 rounded-lg border border-info-200">
              <Package className="w-5 h-5 text-info-500 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-body-sm font-medium text-info-700">Reposição Pendente</h4>
                <p className="text-body-sm text-info-600">5 produtos aguardando fornecedor</p>
                <span className="text-caption text-info-500">Prazo: 3 dias</span>
              </div>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard
          title="Tarefas Pendentes"
          value=""
          variant="elevated"
        >
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-secondary rounded-lg">
              <div className="w-2 h-2 bg-brand-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <h4 className="text-body-sm font-medium text-primary">Revisar fotos Produto ABC</h4>
                <p className="text-body-sm text-secondary">Atribuído para Maria</p>
                <span className="text-caption text-tertiary">Prazo: Hoje</span>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-secondary rounded-lg">
              <div className="w-2 h-2 bg-warning-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <h4 className="text-body-sm font-medium text-primary">Negociar frete transportadora</h4>
                <p className="text-body-sm text-secondary">Atribuído para João</p>
                <span className="text-caption text-tertiary">Prazo: Amanhã</span>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-secondary rounded-lg">
              <CheckCircle className="w-5 h-5 text-success-500 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-body-sm font-medium text-primary">Atualizar preços ML</h4>
                <p className="text-body-sm text-secondary">Concluído por Pedro</p>
                <span className="text-caption text-success-500">Finalizado</span>
              </div>
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Fluxo de Caixa */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Saldo Atual"
          value="R$ 45.230"
          change={{
            value: 8,
            period: "vs ontem"
          }}
          icon={DollarSign}
          color="success"
        />
        
        <MetricCard
          title="A Receber (7 dias)"
          value="R$ 28.450"
          icon={TrendingUp}
          color="info"
        />
        
        <MetricCard
          title="A Pagar (7 dias)"
          value="R$ 12.890"
          icon={Users}
          color="warning"
        />
      </div>
    </div>
  )
})

PremiumDashboardContent.displayName = 'PremiumDashboardContent'
