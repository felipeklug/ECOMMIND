'use client'

import {
  LayoutDashboard,
  DollarSign,
  TrendingUp,
  Package,
  Megaphone,
  FileText,
  Calendar,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react'
import { useSidebar } from '@/hooks/useSidebar'
import { useTheme } from '@/hooks/useTheme'
import { SidebarItem } from './SidebarItem'

const menuItems = [
  {
    href: '/dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
    description: 'Visão geral customizada'
  },
  {
    href: '/dashboard/financeiro',
    icon: DollarSign,
    label: 'Financeiro',
    description: 'DRE por canal e rentabilidade'
  },
  {
    href: '/dashboard/vendas',
    icon: TrendingUp,
    label: 'Vendas & Metas',
    description: 'Performance e metas por canal'
  },
  {
    href: '/dashboard/estoque',
    icon: Package,
    label: 'Estoque',
    description: 'Operações e previsões',
    badge: '3'
  },
  {
    href: '/dashboard/marketing',
    icon: Megaphone,
    label: 'Marketing',
    description: 'Tráfego pago e ROI'
  },
  {
    href: '/dashboard/orcamento',
    icon: FileText,
    label: 'Orçamento',
    description: 'Planejamento empresarial'
  },
  {
    href: '/dashboard/calendario',
    icon: Calendar,
    label: 'Calendário',
    description: 'Planejamento e datas importantes'
  }
]

export function Sidebar() {
  const { isCollapsed, isMobileOpen, toggleCollapsed, toggleMobile } = useSidebar()
  const { theme, toggleTheme, mounted } = useTheme()

  // Não renderizar até que o tema seja carregado
  if (!mounted) {
    return null
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleMobile}
        />
      )}

      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobile}
        className="fixed top-4 left-4 z-50 md:hidden p-2 bg-surface border border-border rounded-lg shadow-lg"
      >
        {isMobileOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      {/* Sidebar - Mosaic Style */}
      <aside
        id="sidebar"
        className={`
          fixed top-0 left-0 h-full bg-surface border-r border-border z-50
          transition-all duration-300 ease-in-out shadow-lg
          ${isCollapsed ? 'w-16' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          md:relative md:translate-x-0
        `}
      >
        {/* Header */}
        <div className={`
          flex items-center gap-3 p-4 border-b border-border
          ${isCollapsed ? 'justify-center' : 'justify-between'}
        `}>
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <div>
                <h1 className="font-bold text-sm">ECOMMIND</h1>
                <p className="text-xs text-muted">Gestão Inteligente</p>
              </div>
            </div>
          )}
          
          {isCollapsed && (
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
          )}

          {/* Collapse Button - Desktop Only */}
          <button
            onClick={toggleCollapsed}
            className="hidden md:flex p-1.5 hover:bg-surface-hover rounded-md transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {!isCollapsed && (
            <div className="mb-4">
              <h2 className="text-xs font-semibold text-muted uppercase tracking-wider px-3">
                MÓDULOS PRINCIPAIS
              </h2>
            </div>
          )}

          {menuItems.map((item) => (
            <SidebarItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              description={item.description}
              badge={item.badge}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-1">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`
              group relative flex items-center gap-3 px-3 py-2.5 rounded-lg w-full
              transition-all duration-200 ease-in-out
              hover:bg-surface-hover focus:bg-surface-hover focus:outline-none
              text-text hover:text-text
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >
            <div className={`
              flex-shrink-0 flex items-center justify-center
              ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}
              transition-all duration-200
            `}>
              {theme === 'light' ? (
                <Moon className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} text-current`} />
              ) : (
                <Sun className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} text-current`} />
              )}
            </div>

            {!isCollapsed && (
              <span className="font-medium text-sm truncate text-current">
                {theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
              </span>
            )}

            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className={`
                absolute left-full ml-2 px-2 py-1 bg-surface border border-border
                rounded-md shadow-lg text-sm font-medium whitespace-nowrap
                opacity-0 invisible group-hover:opacity-100 group-hover:visible
                transition-all duration-200 z-50 text-text
              `}>
                {theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
              </div>
            )}
          </button>

          <SidebarItem
            href="/dashboard/configuracoes"
            icon={Settings}
            label="Configurações"
            description="Preferências e ajustes"
          />
        </div>
      </aside>
    </>
  )
}
