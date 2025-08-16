'use client'

import { memo, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSidebar } from '@/hooks/useSidebar'
import { useTheme } from '@/hooks/useTheme'
import { Badge } from '@/components/ui/badge'
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
  Zap,
  Crown,
  Star,
  Sparkles
} from 'lucide-react'

interface NavigationItem {
  id: string
  name: string
  href: string
  icon: any
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
      href={item.href as any}
      className={`
        group relative flex items-center gap-4 px-4 py-4 rounded-2xl
        transition-all duration-300 ease-out
        ${isActive 
          ? 'bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white shadow-2xl shadow-purple-500/25 scale-105' 
          : 'text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white hover:shadow-xl hover:scale-105'
        }
        ${isCollapsed ? 'justify-center px-3' : ''}
      `}
    >
      {/* Icon with premium styling */}
      <div className={`
        flex-shrink-0 flex items-center justify-center
        ${isCollapsed ? 'w-8 h-8' : 'w-6 h-6'}
        transition-all duration-300
        ${isActive ? 'text-white' : ''}
      `}>
        <Icon className={`${isCollapsed ? 'w-8 h-8' : 'w-6 h-6'}`} />
      </div>

      {/* Label and Description */}
      {!isCollapsed && (
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className={`
              font-semibold text-base truncate
              ${isActive ? 'text-white' : ''}
            `}>
              {item.name}
            </span>
            
            {item.badge && (
              <Badge className={`
                ${isActive 
                  ? 'bg-white/20 text-white border-white/30' 
                  : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                }
              `}>
                {item.badge}
              </Badge>
            )}
          </div>
          
          <p className={`
            text-sm mt-1 truncate
            ${isActive ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}
          `}>
            {item.description}
          </p>
        </div>
      )}

      {/* Active indicator */}
      {isActive && !isCollapsed && (
        <div className="absolute right-3 w-2 h-8 bg-white/30 rounded-full" />
      )}

      {/* Tooltip for collapsed state */}
      {isCollapsed && (
        <div className={`
          absolute left-full ml-4 px-4 py-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50
          rounded-xl shadow-2xl text-sm font-semibold whitespace-nowrap z-50
          opacity-0 invisible group-hover:opacity-100 group-hover:visible
          transition-all duration-300 pointer-events-none
          ${isActive ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-purple-500/50' : 'text-slate-900 dark:text-white'}
        `}>
          <div className="font-semibold">{item.name}</div>
          <div className="text-xs opacity-80 mt-1">{item.description}</div>
          {item.badge && (
            <Badge className="mt-2 text-xs">
              {item.badge}
            </Badge>
          )}
        </div>
      )}
    </Link>
  )
})

SidebarItem.displayName = 'SidebarItem'

export const UltraPremiumSidebar = memo(() => {
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
        bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50
        ${isCollapsed ? 'w-20' : 'w-80'}
        transition-all duration-300 ease-out
      `} />
    )
  }

  return (
    <aside className={`
      bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50
      ${isCollapsed ? 'w-20' : 'w-80'}
      transition-all duration-300 ease-out
      flex flex-col h-full relative z-20 shadow-2xl
    `}>
      {/* Ultra Premium Header */}
      <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/25">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Star className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <div className="text-xl font-black bg-gradient-to-r from-slate-900 via-purple-800 to-blue-800 dark:from-white dark:via-purple-200 dark:to-blue-200 bg-clip-text text-transparent">
                  ECOMMIND
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  Gestão Inteligente
                </div>
              </div>
            </div>
          )}
          
          {isCollapsed && (
            <div className="relative mx-auto">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/25">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <Star className="w-3 h-3 text-white" />
              </div>
            </div>
          )}
          
          {!isCollapsed && (
            <button
              onClick={toggleCollapsed}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6 space-y-2">
        {!isCollapsed && (
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-6">
            <Sparkles className="w-4 h-4" />
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
      <div className="p-6 border-t border-slate-200/50 dark:border-slate-700/50 space-y-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`
            group relative flex items-center gap-4 px-4 py-4 rounded-2xl w-full
            transition-all duration-300 ease-out
            text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white hover:shadow-xl hover:scale-105
            ${isCollapsed ? 'justify-center px-3' : ''}
          `}
        >
          <div className={`
            flex-shrink-0 flex items-center justify-center
            ${isCollapsed ? 'w-8 h-8' : 'w-6 h-6'}
            transition-all duration-300
          `}>
            {theme === 'light' ? (
              <Moon className={`${isCollapsed ? 'w-8 h-8' : 'w-6 h-6'}`} />
            ) : (
              <Sun className={`${isCollapsed ? 'w-8 h-8' : 'w-6 h-6'}`} />
            )}
          </div>

          {!isCollapsed && (
            <span className="font-semibold text-base">
              {theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
            </span>
          )}

          {isCollapsed && (
            <div className={`
              absolute left-full ml-4 px-4 py-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50
              rounded-xl shadow-2xl text-sm font-semibold whitespace-nowrap z-50
              opacity-0 invisible group-hover:opacity-100 group-hover:visible
              transition-all duration-300 pointer-events-none text-slate-900 dark:text-white
            `}>
              {theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
            </div>
          )}
        </button>

        {/* Settings */}
        <Link
          href="/dashboard/configuracoes"
          className={`
            group relative flex items-center gap-4 px-4 py-4 rounded-2xl
            transition-all duration-300 ease-out
            text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white hover:shadow-xl hover:scale-105
            ${isCollapsed ? 'justify-center px-3' : ''}
          `}
        >
          <div className={`
            flex-shrink-0 flex items-center justify-center
            ${isCollapsed ? 'w-8 h-8' : 'w-6 h-6'}
            transition-all duration-300
          `}>
            <Settings className={`${isCollapsed ? 'w-8 h-8' : 'w-6 h-6'}`} />
          </div>

          {!isCollapsed && (
            <span className="font-semibold text-base">
              Configurações
            </span>
          )}

          {isCollapsed && (
            <div className={`
              absolute left-full ml-4 px-4 py-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50
              rounded-xl shadow-2xl text-sm font-semibold whitespace-nowrap z-50
              opacity-0 invisible group-hover:opacity-100 group-hover:visible
              transition-all duration-300 pointer-events-none text-slate-900 dark:text-white
            `}>
              Configurações
            </div>
          )}
        </Link>
      </div>

      {/* Collapse button for collapsed state */}
      {isCollapsed && (
        <button
          onClick={toggleCollapsed}
          className="absolute -right-4 top-8 w-8 h-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 z-30"
        >
          <ChevronRight className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        </button>
      )}
    </aside>
  )
})

UltraPremiumSidebar.displayName = 'UltraPremiumSidebar'
