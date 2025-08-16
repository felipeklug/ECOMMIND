'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  DollarSign,
  Package,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Zap,
  Crown,
  Star,
  Sun,
  Moon,
  Settings
} from 'lucide-react'

export function UltraPremiumDashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/25">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <Star className="w-3 h-3 text-white" />
            </div>
          </div>

          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-slate-900 via-purple-800 to-blue-800 dark:from-white dark:via-purple-200 dark:to-blue-200 bg-clip-text text-transparent mb-2 leading-tight">
              Dashboard Principal
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 font-medium">
              Visão geral completa do seu e-commerce
            </p>
          </div>
        </div>
      </div>

      {/* Ultra Premium Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Pedidos Card */}
          <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
            <CardHeader className="relative pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-slate-600 dark:text-slate-300">
                  Pedidos
                </CardTitle>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex items-baseline space-x-3 mb-3">
                <span className="text-4xl font-black text-slate-900 dark:text-white">47</span>
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  +8%
                </Badge>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">vs ontem</p>
            </CardContent>
          </Card>

          {/* Ticket Médio Card */}
          <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5"></div>
            <CardHeader className="relative pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-slate-600 dark:text-slate-300">
                  Ticket Médio
                </CardTitle>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex items-baseline space-x-3 mb-3">
                <span className="text-4xl font-black text-slate-900 dark:text-white">R$ 264,89</span>
                <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0">
                  <ArrowDownRight className="w-3 h-3 mr-1" />
                  -3%
                </Badge>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">vs ontem</p>
            </CardContent>
          </Card>

          {/* Conversão Card */}
          <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"></div>
            <CardHeader className="relative pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-slate-600 dark:text-slate-300">
                  Conversão
                </CardTitle>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <Target className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex items-baseline space-x-3 mb-3">
                <span className="text-4xl font-black text-slate-900 dark:text-white">3.2%</span>
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  +12%
                </Badge>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">vs semana</p>
            </CardContent>
          </Card>
        </div>

      {/* Ultra Premium Performance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Vendas por Canal */}
          <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5"></div>
            <CardHeader className="relative">
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                <Sparkles className="w-6 h-6 mr-3 text-orange-500" />
                Performance por Canal
              </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-2xl">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Mercado Livre</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">R$ 7.200</p>
                  </div>
                  <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-0">
                    58%
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Shopee</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">R$ 3.100</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">
                    25%
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-2xl">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Site Próprio</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">R$ 2.150</p>
                  </div>
                  <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-0">
                    17%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alertas Críticos */}
          <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5"></div>
            <CardHeader className="relative">
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                <Zap className="w-6 h-6 mr-3 text-red-500" />
                Alertas Críticos
              </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 rounded-2xl border-l-4 border-red-500">
                <div className="flex items-start space-x-3">
                  <Package className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Produto X com estoque baixo</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Estoque para 3 dias</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-2xl border-l-4 border-yellow-500">
                <div className="flex items-start space-x-3">
                  <TrendingDown className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Margem do Produto Y baixa</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">12% (meta: 25%)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      {/* Ultra Premium Financial Overview */}
      <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5"></div>
        <CardHeader className="relative">
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
            <DollarSign className="w-8 h-8 mr-3 text-green-500" />
            Fluxo de Caixa
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-3xl">
              <p className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">Hoje</p>
              <p className="text-4xl font-black text-green-600 dark:text-green-400">+R$ 8.500</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-3xl">
              <p className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">Próximos 7 dias</p>
              <p className="text-4xl font-black text-blue-600 dark:text-blue-400">+R$ 45.200</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
