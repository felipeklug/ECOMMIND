'use client'

import { memo } from 'react'
import type { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Bell,
  Search,
  User as UserIcon,
  ChevronDown,
  Zap,
  Crown,
  Star,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

interface UltraPremiumHeaderProps {
  user: User
}

export const UltraPremiumHeader = memo(({ user }: UltraPremiumHeaderProps) => {
  const { theme, toggleTheme, mounted } = useTheme()

  if (!mounted) {
    return null
  }

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 px-8 py-6 relative z-20">
      <div className="flex items-center justify-between">
        {/* Left Section - Welcome */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/25">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <Crown className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-purple-800 to-blue-800 dark:from-white dark:via-purple-200 dark:to-blue-200 bg-clip-text text-transparent leading-tight">
                Bem-vindo de volta! 👋
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300 font-medium">
                Aqui está o que está acontecendo hoje
              </p>
            </div>
          </div>
        </div>

        {/* Center Section - Quick Stats */}
        <div className="hidden lg:flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="text-center px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-2xl border border-green-200/50 dark:border-green-800/50">
              <div className="text-2xl font-black text-green-600 dark:text-green-400">47</div>
              <div className="text-xs font-semibold text-green-700 dark:text-green-300">Pedidos Hoje</div>
            </div>
            
            <div className="text-center px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl border border-blue-200/50 dark:border-blue-800/50">
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400">R$ 12.4k</div>
              <div className="text-xs font-semibold text-blue-700 dark:text-blue-300">Vendas Hoje</div>
            </div>
            
            <div className="text-center px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-2xl border border-purple-200/50 dark:border-purple-800/50">
              <div className="text-2xl font-black text-purple-600 dark:text-purple-400">3.2%</div>
              <div className="text-xs font-semibold text-purple-700 dark:text-purple-300">Conversão</div>
            </div>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <Button
            variant="outline"
            size="lg"
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hidden md:flex"
          >
            <Search className="w-5 h-5 mr-2" />
            Buscar...
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="outline"
            size="lg"
            onClick={toggleTheme}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </Button>

          {/* Notifications */}
          <Button
            variant="outline"
            size="lg"
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 relative"
          >
            <Bell className="w-5 h-5" />
            <Badge className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 text-white border-0 text-xs">
              3
            </Badge>
          </Button>

          {/* User Menu */}
          <Button
            variant="outline"
            size="lg"
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  {user.email?.split('@')[0] || 'Usuário'}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Premium
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            </div>
          </Button>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0 px-3 py-1">
            <Zap className="w-3 h-3 mr-1" />
            2 Alertas Críticos
          </Badge>
          
          <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-0 px-3 py-1">
            3 Tarefas Pendentes
          </Badge>
          
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0 px-3 py-1">
            Meta do Mês: 85%
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/25"
          >
            <Star className="w-4 h-4 mr-2" />
            Relatório Executivo
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50"
          >
            Exportar Dados
          </Button>
        </div>
      </div>
    </header>
  )
})

UltraPremiumHeader.displayName = 'UltraPremiumHeader'
