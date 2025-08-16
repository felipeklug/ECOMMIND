/**
 * KPI Cards Widget
 * Displays main KPI metrics in card format
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Package, 
  ShoppingCart, 
  CheckSquare,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { useKpiRevenueMTD } from '@/features/dashboard/hooks/use-kpi-revenue-mtd';
import { useKpiProductsCount } from '@/features/dashboard/hooks/use-kpi-products-count';
import { useKpiOrdersCount } from '@/features/dashboard/hooks/use-kpi-orders-count';
import { useKpiMissionsOpen } from '@/features/dashboard/hooks/use-kpi-missions-open';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string;
  change?: {
    value: string;
    type: 'positive' | 'negative' | 'neutral';
    label: string;
  };
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
  error?: string;
}

function KpiCard({ title, value, change, icon: Icon, loading, error }: KpiCardProps) {
  if (error) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-destructive">Erro ao carregar</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <div className="flex items-center space-x-2 mt-2">
            <Badge
              variant="secondary"
              className={cn(
                'text-xs',
                change.type === 'positive' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                change.type === 'negative' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                change.type === 'neutral' && 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
              )}
            >
              {change.type === 'positive' && <TrendingUp className="h-3 w-3 mr-1" />}
              {change.type === 'negative' && <TrendingDown className="h-3 w-3 mr-1" />}
              {change.type === 'neutral' && <Minus className="h-3 w-3 mr-1" />}
              {change.value}
            </Badge>
            <span className="text-xs text-muted-foreground">{change.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function KpiCards() {
  const { data: revenueData, isLoading: revenueLoading, error: revenueError } = useKpiRevenueMTD();
  const { data: productsData, isLoading: productsLoading, error: productsError } = useKpiProductsCount();
  const { data: ordersData, isLoading: ordersLoading, error: ordersError } = useKpiOrdersCount();
  const { data: missionsData, isLoading: missionsLoading, error: missionsError } = useKpiMissionsOpen();

  const cards = [
    {
      title: 'Receita MTD',
      value: revenueLoading ? '...' : revenueData ? formatCurrency(revenueData.current) : 'R$ 0',
      change: revenueData?.previous ? {
        value: `${revenueData.changePercent > 0 ? '+' : ''}${revenueData.changePercent.toFixed(1)}%`,
        type: revenueData.changePercent > 0 ? 'positive' as const : 
              revenueData.changePercent < 0 ? 'negative' as const : 'neutral' as const,
        label: 'vs mês anterior'
      } : undefined,
      icon: DollarSign,
      loading: revenueLoading,
      error: revenueError?.message,
    },
    {
      title: 'Produtos Sincronizados',
      value: productsLoading ? '...' : productsData ? formatNumber(productsData.total) : '0',
      change: productsData?.lastSync ? {
        value: `${productsData.recentlyAdded} novos`,
        type: productsData.recentlyAdded > 0 ? 'positive' as const : 'neutral' as const,
        label: 'últimas 24h'
      } : undefined,
      icon: Package,
      loading: productsLoading,
      error: productsError?.message,
    },
    {
      title: 'Pedidos do Mês',
      value: ordersLoading ? '...' : ordersData ? formatNumber(ordersData.currentMonth) : '0',
      change: ordersData?.previousMonth ? {
        value: `${ordersData.changePercent > 0 ? '+' : ''}${ordersData.changePercent.toFixed(1)}%`,
        type: ordersData.changePercent > 0 ? 'positive' as const : 
              ordersData.changePercent < 0 ? 'negative' as const : 'neutral' as const,
        label: 'vs mês anterior'
      } : undefined,
      icon: ShoppingCart,
      loading: ordersLoading,
      error: ordersError?.message,
    },
    {
      title: 'Missões Abertas',
      value: missionsLoading ? '...' : missionsData ? formatNumber(missionsData.open) : '0',
      change: missionsData ? {
        value: `${missionsData.priority.P1} P1`,
        type: missionsData.priority.P1 > 0 ? 'negative' as const : 'positive' as const,
        label: 'alta prioridade'
      } : undefined,
      icon: CheckSquare,
      loading: missionsLoading,
      error: missionsError?.message,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <KpiCard
          key={index}
          title={card.title}
          value={card.value}
          change={card.change}
          icon={card.icon}
          loading={card.loading}
          error={card.error}
        />
      ))}
    </div>
  );
}
