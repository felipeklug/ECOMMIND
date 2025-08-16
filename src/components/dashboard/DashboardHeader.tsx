'use client'

import { useState } from 'react'
import { 
  Bell, 
  Calendar, 
  TrendingUp, 
  Settings, 
  LogOut, 
  ChevronDown,
  Search,
  Filter
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import { useSidebar } from '@/hooks/useSidebar'

interface DashboardHeaderProps {
  user: User
  title?: string
  subtitle?: string
}

export function DashboardHeader({ user, title = "Dashboard", subtitle }: DashboardHeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const router = useRouter()
  const { isCollapsed } = useSidebar()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const notifications = [
    {
      id: 1,
      title: 'Estoque baixo',
      message: 'Produto XYZ com apenas 3 unidades',
      time: '5 min',
      type: 'warning'
    },
    {
      id: 2,
      title: 'Meta atingida',
      message: 'Vendas do mês superaram a meta em 15%',
      time: '1h',
      type: 'success'
    },
    {
      id: 3,
      title: 'Novo pedido',
      message: 'Pedido #1234 no Mercado Livre',
      time: '2h',
      type: 'info'
    }
  ]

  return (
    <header className={`
      sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border
      transition-all duration-300
      ${isCollapsed ? 'md:ml-16' : 'md:ml-64'}
    `}>
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left side - Title and status */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-heading-2 font-semibold">{title}</h1>
            {subtitle && (
              <p className="text-body-small text-muted">{subtitle}</p>
            )}
          </div>
          
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span className="text-caption text-muted">Dados atualizados há 2 min</span>
          </div>
        </div>

        {/* Right side - Actions and user menu */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="hidden md:flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Buscar..."
                className="pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="hidden lg:flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted hover:text-text hover:bg-surface-hover rounded-lg transition-colors">
              <Calendar className="w-4 h-4" />
              Hoje
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted hover:text-text hover:bg-surface-hover rounded-lg transition-colors">
              <TrendingUp className="w-4 h-4" />
              Relatórios
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted hover:text-text hover:bg-surface-hover rounded-lg transition-colors">
              <Filter className="w-4 h-4" />
              Filtros
            </button>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-lg hover:bg-surface-hover transition-colors"
            >
              <Bell className="w-5 h-5 text-muted" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-surface border border-border rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Notificações</h3>
                    <span className="px-2 py-1 bg-error-light text-error text-xs rounded-full">
                      {notifications.length}
                    </span>
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-4 border-b border-border hover:bg-surface-hover transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          notification.type === 'warning' ? 'bg-warning' :
                          notification.type === 'success' ? 'bg-success' : 'bg-accent'
                        }`} />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <p className="text-sm text-muted mt-1">{notification.message}</p>
                          <span className="text-xs text-muted">{notification.time} atrás</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-4">
                  <button className="w-full text-sm text-brand-500 hover:text-brand-600 font-medium">
                    Ver todas as notificações
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-hover transition-colors"
            >
              <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium">
                  {user.user_metadata?.full_name || 'Usuário'}
                </div>
                <div className="text-xs text-muted">{user.email}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-muted" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-border">
                  <div className="text-sm font-medium">
                    {user.user_metadata?.full_name || 'Usuário'}
                  </div>
                  <div className="text-xs text-muted">{user.email}</div>
                </div>
                
                <div className="py-2">
                  <Link
                    href="/dashboard/configuracoes"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-muted hover:text-text hover:bg-surface-hover transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Configurações</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-muted hover:text-text hover:bg-surface-hover transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
