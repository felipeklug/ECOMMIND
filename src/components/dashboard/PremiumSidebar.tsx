'use client'

import React, { memo, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard,
  DollarSign,
  TrendingUp,
  Package,
  Megaphone,
  FileText,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Zap
} from 'lucide-react'
import { useSidebar } from '@/hooks/useSidebar'
import { useTheme } from '@/hooks/useTheme'

interface NavigationItem {
  id: string
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  badge?: string
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Visão geral customizada'
  },
  {
    id: 'financeiro',
    name: 'Financeiro',
    href: '/dashboard/financeiro',
    icon: DollarSign,
    description: 'DRE por canal e rentabilidade'
  },
  {
    id: 'vendas',
    name: 'Vendas & Metas',
    href: '/dashboard/vendas',
    icon: TrendingUp,
    description: 'Performance e metas por canal'
  },
  {
    id: 'estoque',
    name: 'Estoque',
    href: '/dashboard/estoque',
    icon: Package,
    description: 'Operações e previsões',
    badge: '3'
  },
  {
    id: 'marketing',
    name: 'Marketing',
    href: '/dashboard/marketing',
    icon: Megaphone,
    description: 'Campanhas e ROI'
  },
  {
    id: 'orcamento',
    name: 'Orçamento',
    href: '/dashboard/orcamento',
    icon: FileText,
    description: 'Planejamento empresarial'
  },
  {
    id: 'calendario',
    name: 'Calendário',
    href: '/dashboard/calendario',
    icon: Calendar,
    description: 'Planejamento e datas importantes'
  }
]

interface SidebarItemProps {
  item: NavigationItem
  isActive: boolean
  isCollapsed: boolean
}

const SidebarItem = memo(({ item, isActive, isCollapsed }: SidebarItemProps) => {
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      className={`
        group relative flex items-center gap-3 px-3 py-3 rounded-xl
        transition-all duration-200 ease-out
        ${isActive 
          ? 'bg-brand text-white shadow-lg shadow-brand-500/25' 
          : 'text-secondary hover:text-primary hover:bg-surface-hover'
        }
        ${isCollapsed ? 'justify-center' : ''}
      `}
    >
      {/* Icon */}
      <div className={`
        flex-shrink-0 flex items-center justify-center
        ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}
        transition-all duration-200
      `}>
        <Icon className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} transition-all duration-200`} />
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm truncate">{item.name}</span>
            {item.badge && (
              <span className={`
                px-1.5 py-0.5 text-xs font-medium rounded-full
                ${isActive 
                  ? 'bg-white/20 text-white' 
                  : 'bg-warning-50 text-warning-500'
                }
              `}>
                {item.badge}
              </span>
            )}
          </div>
          <div className={`
            text-xs mt-0.5 truncate transition-colors duration-200
            ${isActive ? 'text-white/70' : 'text-tertiary'}
          `}>
            {item.description}
          </div>
        </div>
      )}

      {/* Tooltip for collapsed state */}
      {isCollapsed && (
        <div className={`
          absolute left-full ml-3 px-3 py-2 bg-surface-elevated border border-border-default
          rounded-lg shadow-lg text-sm font-medium whitespace-nowrap z-50
          opacity-0 invisible group-hover:opacity-100 group-hover:visible
          transition-all duration-200 pointer-events-none
        `}>
          <div className="font-medium text-primary">{item.name}</div>
          <div className="text-xs text-secondary mt-0.5">{item.description}</div>
          {item.badge && (
            <div className="mt-1">
              <span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-warning-50 text-warning-500">
                {item.badge}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Active indicator */}
      {isActive && !isCollapsed && (
        <div className="absolute right-2 w-1 h-6 bg-white/30 rounded-full" />
      )}
    </Link>
  )
})

SidebarItem.displayName = 'SidebarItem'

export const PremiumSidebar = memo(() => {
  const { isCollapsed, toggleCollapsed } = useSidebar()
  const { theme, toggleTheme, mounted } = useTheme()
  const pathname = usePathname()

  const activeItemId = useMemo(() => {
    return navigationItems.find(item => {
      if (item.href === '/dashboard') {
        return pathname === '/dashboard'
      }
      return pathname.startsWith(item.href)
    })?.id || 'dashboard'
  }, [pathname])

  if (!mounted) {
    return (
      <div className={`
        bg-surface border-r border-border-subtle
        ${isCollapsed ? 'w-16' : 'w-64'}
        transition-all duration-300 ease-out
      `} />
    )
  }

  return (
    <aside className={`
      bg-surface border-r border-border-subtle
      ${isCollapsed ? 'w-16' : 'w-64'}
      transition-all duration-300 ease-out
      flex flex-col h-full
    `}>
      {/* Header */}
      <div className="p-6 border-b border-border-subtle">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-heading-sm text-primary">ECOMMIND</div>
                <div className="text-caption text-secondary">Gestão Inteligente</div>
              </div>
            </div>
          )}
          
          <button
            onClick={toggleCollapsed}
            className={`
              p-2 rounded-lg hover:bg-surface-hover transition-all duration-200
              ${isCollapsed ? 'mx-auto' : ''}
            `}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-secondary" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-secondary" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {!isCollapsed && (
          <div className="text-overline text-tertiary mb-4">
            MÓDULOS PRINCIPAIS
          </div>
        )}
        
        {navigationItems.map((item) => (
          <SidebarItem
            key={item.id}
            item={item}
            isActive={activeItemId === item.id}
            isCollapsed={isCollapsed}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border-subtle space-y-1">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`
            group relative flex items-center gap-3 px-3 py-3 rounded-xl w-full
            transition-all duration-200 ease-out
            text-secondary hover:text-primary hover:bg-surface-hover
            ${isCollapsed ? 'justify-center' : ''}
          `}
        >
          <div className={`
            flex-shrink-0 flex items-center justify-center
            ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}
            transition-all duration-200
          `}>
            {theme === 'light' ? (
              <Moon className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
            ) : (
              <Sun className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
            )}
          </div>

          {!isCollapsed && (
            <span className="font-medium text-sm">
              {theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
            </span>
          )}

          {isCollapsed && (
            <div className={`
              absolute left-full ml-3 px-3 py-2 bg-surface-elevated border border-border-default
              rounded-lg shadow-lg text-sm font-medium whitespace-nowrap z-50
              opacity-0 invisible group-hover:opacity-100 group-hover:visible
              transition-all duration-200 pointer-events-none
            `}>
              {theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
            </div>
          )}
        </button>

        {/* Settings */}
        <SidebarItem
          item={{
            id: 'settings',
            name: 'Configurações',
            href: '/dashboard/configuracoes',
            icon: Settings,
            description: 'Preferências e ajustes'
          }}
          isActive={pathname.startsWith('/dashboard/configuracoes')}
          isCollapsed={isCollapsed}
        />
      </div>
    </aside>
  )
})

PremiumSidebar.displayName = 'PremiumSidebar'
