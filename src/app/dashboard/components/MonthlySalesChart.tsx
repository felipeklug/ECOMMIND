'use client'

import { memo } from 'react'
import { TrendingUp } from 'lucide-react'

interface MonthlySalesChartProps {
  className?: string
}

// Dados mockados para o gráfico de vendas mensais
const monthlyData = [
  { month: 'Jan', sales: 45000, growth: 12 },
  { month: 'Fev', sales: 52000, growth: 15 },
  { month: 'Mar', sales: 48000, growth: -8 },
  { month: 'Abr', sales: 61000, growth: 27 },
  { month: 'Mai', sales: 58000, growth: -5 },
  { month: 'Jun', sales: 67000, growth: 15 },
  { month: 'Jul', sales: 72000, growth: 7 },
  { month: 'Ago', sales: 69000, growth: -4 },
  { month: 'Set', sales: 78000, growth: 13 },
  { month: 'Out', sales: 82000, growth: 5 },
  { month: 'Nov', sales: 89000, growth: 8 },
  { month: 'Dez', sales: 95000, growth: 7 }
]

const maxSales = Math.max(...monthlyData.map(d => d.sales))

export const MonthlySalesChart = memo(({ className = "" }: MonthlySalesChartProps) => {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Vendas Mensais</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Evolução das vendas nos últimos 12 meses</p>
        </div>
        <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-medium">+18% vs ano anterior</span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400 w-12">
          <span>R$ {(maxSales / 1000).toFixed(0)}k</span>
          <span>R$ {(maxSales * 0.75 / 1000).toFixed(0)}k</span>
          <span>R$ {(maxSales * 0.5 / 1000).toFixed(0)}k</span>
          <span>R$ {(maxSales * 0.25 / 1000).toFixed(0)}k</span>
          <span>R$ 0</span>
        </div>

        {/* Chart area */}
        <div className="ml-14 relative">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="border-t border-gray-200 dark:border-slate-700"></div>
            ))}
          </div>

          {/* Bars */}
          <div className="relative flex items-end justify-between h-48 pt-4">
            {monthlyData.map((data, index) => {
              const height = (data.sales / maxSales) * 100
              return (
                <div key={data.month} className="flex flex-col items-center group">
                  {/* Bar */}
                  <div className="relative mb-2">
                    <div
                      className="w-6 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-sm hover:from-purple-700 hover:to-purple-500 transition-all duration-200 group-hover:scale-105"
                      style={{ height: `${height * 1.8}px` }}
                    ></div>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded px-2 py-1 whitespace-nowrap">
                        <div className="font-medium">R$ {(data.sales / 1000).toFixed(0)}k</div>
                        <div className={`text-xs ${data.growth >= 0 ? 'text-green-400 dark:text-green-600' : 'text-red-400 dark:text-red-600'}`}>
                          {data.growth >= 0 ? '+' : ''}{data.growth}%
                        </div>
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
                    </div>
                  </div>
                  
                  {/* Month label */}
                  <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    {data.month}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Média Mensal</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              R$ {(monthlyData.reduce((acc, d) => acc + d.sales, 0) / monthlyData.length / 1000).toFixed(0)}k
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Melhor Mês</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {monthlyData.reduce((max, d) => d.sales > max.sales ? d : max).month}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Crescimento</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">+18%</p>
          </div>
        </div>
      </div>
    </div>
  )
})

MonthlySalesChart.displayName = 'MonthlySalesChart'
