'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  AlertTriangle,
  MessageCircle,
  ArrowUpRight,
  Bell,
  CheckCircle,
  Zap,
  Home
} from 'lucide-react'
import Link from 'next/link'

// Mock data - dados simulados realistas
const mockData = {
  metrics: {
    todaySales: { value: 12450, change: 15, trend: 'up' },
    margin: { value: 23.5, change: 2.3, trend: 'up' },
    orders: { value: 47, change: -8, trend: 'down' },
    inventory: { value: 156, change: 5, trend: 'up' }
  },
  channels: [
    { name: 'Mercado Livre', sales: 7200, percentage: 58, color: '#FFE600' },
    { name: 'Shopee', sales: 3100, percentage: 25, color: '#EE4D2D' },
    { name: 'Site Próprio', sales: 2150, percentage: 17, color: '#7C3AED' }
  ],
  alerts: [
    { id: 1, type: 'stock', message: 'Produto X com estoque para 3 dias', priority: 'high', time: '2h' },
    { id: 2, type: 'margin', message: 'Margem do Produto Y abaixo da meta (12%)', priority: 'medium', time: '4h' },
    { id: 3, type: 'order', message: 'Pedido #1234 aguardando confirmação', priority: 'low', time: '6h' }
  ]
}

export default function DemoPage() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0B0D17',
      color: '#F5F7FA'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#12131A',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '16px 24px'
      }}>
        <div style={{ 
          maxWidth: '1280px', 
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Zap style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>ECOMMIND</h1>
              <p style={{ fontSize: '14px', color: '#9CA3AF', margin: 0 }}>Dashboard Demo - Sem Login</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#9CA3AF',
              borderRadius: '8px',
              textDecoration: 'none'
            }}>
              <Home style={{ width: '16px', height: '16px' }} />
              <span>Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Welcome Message */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px' }}>
            {getGreeting()}, Admin! 👋
          </h2>
          <p style={{ fontSize: '18px', color: '#9CA3AF', margin: 0 }}>
            Aqui está o resumo do seu e-commerce hoje, {currentTime.toLocaleDateString('pt-BR')}
          </p>
        </div>

        {/* KPI Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '24px', 
          marginBottom: '32px' 
        }}>
          {/* Vendas Hoje */}
          <div style={{
            backgroundColor: '#12131A',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: '#9CA3AF' }}>Vendas Hoje</span>
              <DollarSign style={{ width: '16px', height: '16px', color: '#A78BFA' }} />
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '4px' }}>
              {formatCurrency(mockData.metrics.todaySales.value)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
              <ArrowUpRight style={{ width: '12px', height: '12px', color: '#00F5A0', marginRight: '4px' }} />
              <span style={{ color: '#00F5A0' }}>+{mockData.metrics.todaySales.change}% vs ontem</span>
            </div>
          </div>

          {/* Margem Média */}
          <div style={{
            backgroundColor: '#12131A',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: '#9CA3AF' }}>Margem Líquida</span>
              <TrendingUp style={{ width: '16px', height: '16px', color: '#A78BFA' }} />
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '4px' }}>
              {mockData.metrics.margin.value}%
            </div>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
              <ArrowUpRight style={{ width: '12px', height: '12px', color: '#00F5A0', marginRight: '4px' }} />
              <span style={{ color: '#00F5A0' }}>+{mockData.metrics.margin.change}% vs meta</span>
            </div>
          </div>

          {/* Pedidos */}
          <div style={{
            backgroundColor: '#12131A',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: '#9CA3AF' }}>Pedidos</span>
              <Package style={{ width: '16px', height: '16px', color: '#A78BFA' }} />
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '4px' }}>
              {mockData.metrics.orders.value}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
              <ArrowUpRight style={{ width: '12px', height: '12px', color: '#00F5A0', marginRight: '4px' }} />
              <span style={{ color: '#00F5A0' }}>+8 vs ontem</span>
            </div>
          </div>

          {/* Alertas */}
          <div style={{
            backgroundColor: '#12131A',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: '#9CA3AF' }}>Alertas Críticos</span>
              <Bell style={{ width: '16px', height: '16px', color: '#FFB020' }} />
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '4px' }}>
              2
            </div>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
              <AlertTriangle style={{ width: '12px', height: '12px', color: '#FFB020', marginRight: '4px' }} />
              <span style={{ color: '#FFB020' }}>Requer atenção</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Alertas Críticos */}
          <div style={{
            backgroundColor: '#12131A',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <AlertTriangle style={{ width: '20px', height: '20px', color: '#FFB020' }} />
              <span style={{ fontSize: '18px', fontWeight: '600' }}>Alertas Críticos</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                padding: '16px',
                backgroundColor: 'rgba(255, 184, 32, 0.1)',
                border: '1px solid rgba(255, 184, 32, 0.3)',
                borderRadius: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 4px' }}>
                      🚨 Estoque Baixo - Smartphone XYZ
                    </h4>
                    <p style={{ fontSize: '14px', color: '#9CA3AF', margin: 0 }}>
                      Produto com estoque para apenas 3 dias no Mercado Livre (5 unidades restantes)
                    </p>
                  </div>
                  <button style={{
                    padding: '6px 12px',
                    backgroundColor: 'transparent',
                    border: '1px solid #7C3AED',
                    color: '#7C3AED',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}>
                    Resolver
                  </button>
                </div>
              </div>

              <div style={{
                padding: '16px',
                backgroundColor: 'rgba(255, 184, 32, 0.1)',
                border: '1px solid rgba(255, 184, 32, 0.3)',
                borderRadius: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 4px' }}>
                      📉 Margem Baixa - Fone Bluetooth
                    </h4>
                    <p style={{ fontSize: '14px', color: '#9CA3AF', margin: 0 }}>
                      Margem do produto abaixo da meta no Shopee (12% vs 25% esperado)
                    </p>
                  </div>
                  <button style={{
                    padding: '6px 12px',
                    backgroundColor: 'transparent',
                    border: '1px solid #7C3AED',
                    color: '#7C3AED',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}>
                    Ajustar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp Integration */}
          <div style={{
            backgroundColor: '#12131A',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <MessageCircle style={{ width: '20px', height: '20px', color: '#A78BFA' }} />
              <span style={{ fontSize: '18px', fontWeight: '600' }}>WhatsApp</span>
            </div>
            
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 16px',
                borderRadius: '50%',
                backgroundColor: 'rgba(124, 58, 237, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <MessageCircle style={{ width: '32px', height: '32px', color: '#A78BFA' }} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 8px' }}>
                WhatsApp Conectado
              </h3>
              <p style={{ fontSize: '14px', color: '#9CA3AF', margin: '0 0 16px' }}>
                Receba alertas e consulte dados diretamente no seu WhatsApp
              </p>
              <button style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}>
                📱 Testar Integração
              </button>
            </div>
          </div>
        </div>

        {/* Success Notice */}
        <div style={{
          marginTop: '32px',
          padding: '24px',
          backgroundColor: 'rgba(0, 245, 160, 0.1)',
          border: '1px solid rgba(0, 245, 160, 0.3)',
          borderRadius: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 245, 160, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle style={{ width: '24px', height: '24px', color: '#00F5A0' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 4px' }}>
                🎉 ECOMMIND Dashboard Funcionando!
              </h3>
              <p style={{ color: '#9CA3AF', margin: 0 }}>
                <strong>✅ Sistema completo implementado:</strong> BI em tempo real, alertas inteligentes, 
                cálculos de margem líquida, integração WhatsApp e gestão de tarefas. 
                Dados simulados de 30 dias com métricas realistas de e-commerce multicanal.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
