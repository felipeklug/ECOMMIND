'use client'

import React, { memo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { 
  Search, 
  Bell, 
  Settings, 
  LogOut, 
  User as UserIcon,
  ChevronDown,
  Filter,
  Calendar,
  Download
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface PremiumHeaderProps {
  user: User
}

export const PremiumHeader = memo(({ user }: PremiumHeaderProps) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const notifications = [
    {
      id: 1,
      title: 'Estoque Baixo',
      message: 'Smartphone XYZ com apenas 3 unidades',
      time: '5 min atrás',
      type: 'warning'
    },
    {
      id: 2,
      title: 'Meta Atingida',
      message: 'Vendas do mês superaram a meta em 15%',
      time: '1h atrás',
      type: 'success'
    },
    {
      id: 3,
      title: 'Novo Pedido',
      message: 'Pedido #1247 no Mercado Livre',
      time: '2h atrás',
      type: 'info'
    }
  ]

  return (
    <header className="bg-surface border-b border-border-subtle px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-6">
          {/* Page Title */}
          <div>
            <h1 className="text-heading-lg text-primary">Dashboard</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-success-500 rounded-full"></div>
              <span className="text-body-sm text-secondary">
                Dados atualizados há 2 min
              </span>
            </div>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-tertiary" />
            <input
              type="text"
              placeholder="Buscar produtos, pedidos, clientes..."
              className="
                w-full pl-10 pr-4 py-2.5 bg-secondary border border-border-default rounded-lg
                text-body-sm text-primary placeholder-tertiary
                focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500
                transition-all duration-200
              "
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Quick Actions */}
          <div className="hidden md:flex items-center gap-2">
            <button className="btn-secondary flex items-center gap-2 text-body-sm">
              <Calendar className="w-4 h-4" />
              Hoje
            </button>
            <button className="btn-secondary flex items-center gap-2 text-body-sm">
              <Filter className="w-4 h-4" />
              Filtros
            </button>
            <button className="btn-secondary flex items-center gap-2 text-body-sm">
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="
                relative p-2.5 rounded-lg hover:bg-surface-hover transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-brand-500/20
              "
            >
              <Bell className="w-5 h-5 text-secondary" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full"></span>
            </button>

            {notificationsOpen && (
              <div className="
                absolute right-0 top-full mt-2 w-80 bg-surface-elevated border border-border-default
                rounded-xl shadow-xl z-50 overflow-hidden
              ">
                <div className="p-4 border-b border-border-subtle">
                  <div className="flex items-center justify-between">
                    <h3 className="text-heading-sm text-primary">Notificações</h3>
                    <span className="px-2 py-1 bg-brand-50 text-brand-500 text-caption rounded-full">
                      {notifications.length}
                    </span>
                  </div>
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-4 hover:bg-surface-hover transition-colors duration-200">
                      <div className="flex items-start gap-3">
                        <div className={`
                          p-1.5 rounded-lg
                          ${notification.type === 'warning' ? 'bg-warning-50' :
                            notification.type === 'success' ? 'bg-success-50' : 'bg-info-50'}
                        `}>
                          <div className={`w-2 h-2 rounded-full ${
                            notification.type === 'warning' ? 'bg-warning-500' :
                            notification.type === 'success' ? 'bg-success-500' : 'bg-info-500'
                          }`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-body-sm font-medium text-primary">{notification.title}</h4>
                          <p className="text-body-sm text-secondary mt-1">{notification.message}</p>
                          <span className="text-caption text-tertiary">{notification.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-4 border-t border-border-subtle">
                  <button className="w-full text-body-sm text-brand font-medium hover:text-brand-600 transition-colors duration-200">
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
              className="
                flex items-center gap-3 p-2 rounded-lg hover:bg-surface-hover
                transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20
              "
            >
              <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
                <span className="text-body-sm font-medium text-white">
                  {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <div className="text-body-sm font-medium text-primary">
                  {user.user_metadata?.full_name || 'Usuário'}
                </div>
                <div className="text-caption text-secondary">{user.email}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-secondary" />
            </button>

            {userMenuOpen && (
              <div className="
                absolute right-0 top-full mt-2 w-56 bg-surface-elevated border border-border-default
                rounded-xl shadow-xl z-50 overflow-hidden
              ">
                <div className="p-4 border-b border-border-subtle">
                  <div className="text-body-sm font-medium text-primary">
                    {user.user_metadata?.full_name || 'Usuário'}
                  </div>
                  <div className="text-caption text-secondary">{user.email}</div>
                </div>
                
                <div className="p-2">
                  <button className="
                    flex items-center gap-3 w-full px-3 py-2 rounded-lg
                    text-body-sm text-secondary hover:text-primary hover:bg-surface-hover
                    transition-all duration-200
                  ">
                    <UserIcon className="w-4 h-4" />
                    <span>Perfil</span>
                  </button>
                  
                  <button className="
                    flex items-center gap-3 w-full px-3 py-2 rounded-lg
                    text-body-sm text-secondary hover:text-primary hover:bg-surface-hover
                    transition-all duration-200
                  ">
                    <Settings className="w-4 h-4" />
                    <span>Configurações</span>
                  </button>
                </div>
                
                <div className="p-2 border-t border-border-subtle">
                  <button
                    onClick={handleLogout}
                    className="
                      flex items-center gap-3 w-full px-3 py-2 rounded-lg
                      text-body-sm text-danger-500 hover:bg-danger-50
                      transition-all duration-200
                    "
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
})

PremiumHeader.displayName = 'PremiumHeader'
