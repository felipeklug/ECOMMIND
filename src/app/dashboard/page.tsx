'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  ArrowUpRight,
  Menu,
  Bell,
  Search,
  Settings,
  Home,
  ShoppingCart,
  BarChart3,
  Calendar,
  FileText,
  Megaphone,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  Activity,
  CreditCard,
  Download,
  Eye,
  MoreHorizontal,
  ArrowDownRight,
  Filter,
  RefreshCw,
  Sun,
  Moon
} from "lucide-react"
import Link from "next/link"
import { getChannelLogo } from '@/components/icons/marketplace-logos'
import { MonthlySalesChart } from './components/MonthlySalesChart'
import { useTheme } from '@/hooks/useTheme'
import './dashboard.css'

// Card types for customization
interface DashboardCard {
  id: string
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: any
  color: string
  bgColor: string
  description?: string
  visible: boolean
}

export default function DashboardPage() {
  const { theme, toggleTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [sidebarPinned, setSidebarPinned] = useState(false)
  const [showCardCustomizer, setShowCardCustomizer] = useState(false)
  const [currentPage, setCurrentPage] = useState('dashboard')

  const [dashboardCards, setDashboardCards] = useState<DashboardCard[]>([
    {
      id: 'revenue',
      title: 'Receita Total',
      value: 'R$ 45.231',
      change: '+20.1%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      description: 'vs mês anterior',
      visible: true
    },
    {
      id: 'orders',
      title: 'Pedidos',
      value: '47',
      change: '+8%',
      changeType: 'positive',
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'vs ontem',
      visible: true
    },
    {
      id: 'sales',
      title: 'Vendas Hoje',
      value: 'R$ 12.450',
      change: '+15%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'vs ontem',
      visible: true
    },
    {
      id: 'conversion',
      title: 'Taxa Conversão',
      value: '3.2%',
      change: '+12%',
      changeType: 'positive',
      icon: BarChart3,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'vs semana',
      visible: true
    },
    {
      id: 'customers',
      title: 'Clientes Ativos',
      value: '1.234',
      change: '+5%',
      changeType: 'positive',
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      description: 'vs mês anterior',
      visible: false
    },
    {
      id: 'margin',
      title: 'Margem Média',
      value: '24.5%',
      change: '-2%',
      changeType: 'negative',
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'vs semana',
      visible: false
    }
  ])

  const toggleCardVisibility = (cardId: string) => {
    setDashboardCards(cards =>
      cards.map(card =>
        card.id === cardId ? { ...card, visible: !card.visible } : card
      )
    )
  }

  return (
    <div className="dashboard-container flex h-screen bg-gray-50 dark:bg-slate-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Ultra Premium with Auto Expand */}
      <div
        className={`dashboard-sidebar inset-y-0 left-0 z-50 border-r transform transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'fixed translate-x-0' : 'fixed -translate-x-full lg:relative lg:translate-x-0'}
          ${sidebarPinned ? 'pinned' : sidebarCollapsed ? 'collapsed' : ''}
        `}
        style={{
          backgroundColor: 'var(--dashboard-surface-elevated)',
          borderColor: 'var(--dashboard-border-subtle)',
          width: sidebarPinned ? '16rem' : sidebarCollapsed ? '5rem' : '16rem'
        }}
        onMouseEnter={() => !sidebarPinned && setSidebarCollapsed(false)}
        onMouseLeave={() => !sidebarPinned && setSidebarCollapsed(true)}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-6" style={{ borderBottom: '1px solid var(--dashboard-border-subtle)' }}>
          <Link href="/dashboard" className={`flex items-center ${sidebarCollapsed && !sidebarPinned ? 'justify-center' : 'space-x-3'}`}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg" style={{
              background: 'linear-gradient(135deg, var(--dashboard-brand-500), var(--dashboard-brand-600))',
              boxShadow: 'var(--dashboard-shadow-md)'
            }}>
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            {(!sidebarCollapsed || sidebarPinned) && <span className="text-xl font-bold" style={{ color: 'var(--dashboard-text-sidebar)' }}>ECOMMIND</span>}
          </Link>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex hover:bg-white/10"
              onClick={() => setSidebarPinned(!sidebarPinned)}
              style={{ color: 'var(--dashboard-text-sidebar)' }}
              title={sidebarPinned ? "Desafixar menu" : "Fixar menu"}
            >
              {sidebarPinned ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden hover:bg-white/10"
              onClick={() => setSidebarOpen(false)}
              style={{ color: 'var(--dashboard-text-sidebar)' }}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4">
          <div className="space-y-2">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`group relative flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 w-full ${sidebarCollapsed && !sidebarPinned ? 'justify-center' : ''}`}
              style={{
                backgroundColor: currentPage === 'dashboard' ? 'var(--dashboard-brand-500)' : 'transparent',
                color: currentPage === 'dashboard' ? 'var(--dashboard-text-inverse)' : 'var(--dashboard-text-sidebar)',
                boxShadow: currentPage === 'dashboard' ? 'var(--dashboard-shadow-md)' : 'none'
              }}
            >
              <Home className="w-5 h-5 flex-shrink-0" />
              {(!sidebarCollapsed || sidebarPinned) && <span className="ml-3">Dashboard</span>}
              {sidebarCollapsed && !sidebarPinned && (
                <div className="absolute left-full ml-6 px-2 py-1 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 text-xs"
                     style={{
                       backgroundColor: 'var(--dashboard-surface)',
                       color: 'var(--dashboard-text-primary)',
                       border: '1px solid var(--dashboard-border-default)',
                       boxShadow: 'var(--dashboard-shadow-lg)'
                     }}>
                  Dashboard
                </div>
              )}
            </button>

            <Link
              href="/dashboard/vendas"
              className={`group relative flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-surface-hover ${sidebarCollapsed ? 'justify-center' : ''}`}
              style={{ color: 'var(--text-secondary)' }}
            >
              <TrendingUp className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="ml-3">Vendas & Metas</span>}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-6 px-2 py-1 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 text-xs"
                     style={{
                       backgroundColor: 'var(--surface-elevated)',
                       color: 'var(--text-primary)',
                       border: '1px solid var(--border-default)',
                       boxShadow: 'var(--shadow-lg)'
                     }}>
                  Vendas & Metas
                </div>
              )}
            </Link>

            <Link
              href="/dashboard/financeiro"
              className={`group relative flex items-center px-4 py-3 text-sm font-medium text-gray-300 rounded-lg hover:bg-slate-700/50 hover:text-white transition-all duration-200 ${sidebarCollapsed ? 'justify-center' : ''}`}
            >
              <DollarSign className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="ml-3">Financeiro</span>}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-6 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                  Financeiro
                </div>
              )}
            </Link>

            <Link
              href="/dashboard/estoque"
              className={`group relative flex items-center px-4 py-3 text-sm font-medium text-gray-300 rounded-lg hover:bg-slate-700/50 hover:text-white transition-all duration-200 ${sidebarCollapsed ? 'justify-center' : ''}`}
            >
              <Package className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && (
                <>
                  <span className="ml-3">Estoque</span>
                  <Badge className="ml-auto bg-red-500 text-white text-xs px-2 py-1">3</Badge>
                </>
              )}
              {sidebarCollapsed && (
                <>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">3</div>
                  <div className="absolute left-full ml-6 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                    Estoque (3 alertas)
                  </div>
                </>
              )}
            </Link>

            <Link
              href="/dashboard/marketing"
              className={`group relative flex items-center px-4 py-3 text-sm font-medium text-gray-300 rounded-lg hover:bg-slate-700/50 hover:text-white transition-all duration-200 ${sidebarCollapsed ? 'justify-center' : ''}`}
            >
              <Megaphone className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="ml-3">Marketing</span>}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-6 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                  Marketing
                </div>
              )}
            </Link>

            <Link
              href="/dashboard/calendario"
              className={`group relative flex items-center px-4 py-3 text-sm font-medium text-gray-300 rounded-lg hover:bg-slate-700/50 hover:text-white transition-all duration-200 ${sidebarCollapsed ? 'justify-center' : ''}`}
            >
              <Calendar className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="ml-3">Calendário</span>}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-6 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                  Calendário
                </div>
              )}
            </Link>

            <Link
              href="/dashboard/orcamento"
              className={`group relative flex items-center px-4 py-3 text-sm font-medium text-gray-300 rounded-lg hover:bg-slate-700/50 hover:text-white transition-all duration-200 ${sidebarCollapsed ? 'justify-center' : ''}`}
            >
              <FileText className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="ml-3">Orçamento</span>}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-6 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                  Orçamento
                </div>
              )}
            </Link>
          </div>


        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Ultra Premium */}
        <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-gray-600 dark:text-gray-400"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative text-gray-600 dark:text-gray-400">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">3</span>
              </Button>

              <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-400">
                <Search className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 dark:text-gray-400"
                onClick={toggleTheme}
                title={theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">U</span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Usuário</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Premium</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area - Ultra Premium */}
        <main className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-slate-900">
          {/* Page header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Visão Geral</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">Bem-vindo de volta! Aqui está o que está acontecendo com seu e-commerce.</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </div>

          {/* Header with customization */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Métricas Principais</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Acompanhe os indicadores mais importantes do seu negócio</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowCardCustomizer(!showCardCustomizer)}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
            >
              <Settings className="w-4 h-4 mr-2" />
              Personalizar Cards
            </Button>
          </div>

          {/* Card Customizer */}
          {showCardCustomizer && (
            <div className="card-elevated p-6 mb-8" style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-lg)'
            }}>
              <h3 className="text-heading-md mb-6" style={{ color: 'var(--text-primary)' }}>Personalizar Dashboard</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboardCards.map((card) => (
                  <div key={card.id} className="flex items-center justify-between p-4 rounded-lg transition-all duration-200" style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{
                        backgroundColor: card.id === 'revenue' ? 'var(--success-50)' :
                                       card.id === 'orders' ? 'var(--info-50)' :
                                       card.id === 'sales' ? 'var(--brand-50)' :
                                       card.id === 'conversion' ? 'var(--warning-50)' :
                                       card.id === 'customers' ? 'var(--brand-50)' :
                                       'var(--danger-50)'
                      }}>
                        <card.icon className="w-5 h-5" style={{
                          color: card.id === 'revenue' ? 'var(--success-500)' :
                                 card.id === 'orders' ? 'var(--info-500)' :
                                 card.id === 'sales' ? 'var(--brand-500)' :
                                 card.id === 'conversion' ? 'var(--warning-500)' :
                                 card.id === 'customers' ? 'var(--brand-500)' :
                                 'var(--danger-500)'
                        }} />
                      </div>
                      <span className="text-body-sm font-medium" style={{ color: 'var(--text-primary)' }}>{card.title}</span>
                    </div>
                    <Button
                      variant={card.visible ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleCardVisibility(card.id)}
                      className={card.visible ? "btn-primary" : "btn-secondary"}
                    >
                      {card.visible ? "Visível" : "Oculto"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compact Premium Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {dashboardCards.filter(card => card.visible).map((card) => (
              <div key={card.id} className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4 hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      card.id === 'revenue' ? 'bg-green-100 dark:bg-green-900/30' :
                      card.id === 'orders' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      card.id === 'sales' ? 'bg-purple-100 dark:bg-purple-900/30' :
                      card.id === 'conversion' ? 'bg-orange-100 dark:bg-orange-900/30' :
                      'bg-gray-100 dark:bg-gray-900/30'
                    }`}>
                      <card.icon className={`w-5 h-5 ${
                        card.id === 'revenue' ? 'text-green-600 dark:text-green-400' :
                        card.id === 'orders' ? 'text-blue-600 dark:text-blue-400' :
                        card.id === 'sales' ? 'text-purple-600 dark:text-purple-400' :
                        card.id === 'conversion' ? 'text-orange-600 dark:text-orange-400' :
                        'text-gray-600 dark:text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.title}</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{card.value}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      card.changeType === 'positive' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      card.changeType === 'negative' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                    }`}>
                      {card.change}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{card.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Monthly Sales Chart */}
          <div className="mb-6">
            <MonthlySalesChart />
          </div>

          {/* Main dashboard grid - Mosaic Style */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance por Canal */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Performance por Canal</h3>
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-5 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm">
                        {getChannelLogo('mercadolivre', 'w-12 h-12')}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">Mercado Livre</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">R$ 7.200 em vendas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">58%</p>
                      <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
                        <ArrowUpRight className="w-3 h-3 mr-1" />
                        +12%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-5 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-200 dark:border-orange-800 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm">
                        {getChannelLogo('shopee', 'w-12 h-12')}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">Shopee</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">R$ 3.100 em vendas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">25%</p>
                      <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
                        <ArrowUpRight className="w-3 h-3 mr-1" />
                        +8%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-5 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm">
                        {getChannelLogo('lojapropria', 'w-12 h-12')}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">Site Próprio</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">R$ 2.150 em vendas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">17%</p>
                      <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                        <ArrowDownRight className="w-3 h-3 mr-1" />
                        -3%
                      </p>
                    </div>
                  </div>

                  {/* Amazon Channel */}
                  <div className="flex items-center justify-between p-5 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl border border-orange-200 dark:border-orange-800 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm">
                        {getChannelLogo('amazon', 'w-12 h-12')}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">Amazon</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">R$ 1.890 em vendas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">12%</p>
                      <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
                        <ArrowUpRight className="w-3 h-3 mr-1" />
                        +5%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Alertas Críticos */}
            <div>
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Alertas Críticos</h3>
                  <Badge className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800">2</Badge>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                    <div className="flex items-start space-x-3">
                      <Package className="w-5 h-5 text-red-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Produto X com estoque baixo</p>
                        <p className="text-xs text-gray-600 mt-1">Estoque para apenas 3 dias</p>
                        <Button size="sm" className="mt-2 bg-red-600 hover:bg-red-700 text-white">
                          Reabastecer
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                    <div className="flex items-start space-x-3">
                      <TrendingDown className="w-5 h-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Margem do Produto Y baixa</p>
                        <p className="text-xs text-gray-600 mt-1">12% (meta: 25%)</p>
                        <Button size="sm" variant="outline" className="mt-2 border-yellow-500 text-yellow-700 hover:bg-yellow-50">
                          Ajustar Preço
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <div className="flex items-start space-x-3">
                      <Activity className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Meta do mês: 85%</p>
                        <p className="text-xs text-gray-600 mt-1">Faltam R$ 15k para 100%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
