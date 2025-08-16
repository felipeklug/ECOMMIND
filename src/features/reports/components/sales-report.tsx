/**
 * Sales Report Component
 * Detailed sales analytics with charts and insights
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
  Minus,
} from 'lucide-react';
import { useSalesReport } from '@/features/reports/hooks/use-sales-report';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface SalesReportProps {
  period: string;
  filters: {
    from: string;
    to: string;
    channel: string;
  };
}

const CHANNEL_COLORS = {
  meli: '#FFE600',
  shopee: '#EE4D2D',
  amazon: '#FF9900',
  site: '#0066CC',
  unknown: '#6B7280',
};

export function SalesReport({ period, filters }: SalesReportProps) {
  const [selectedChannel, setSelectedChannel] = useState(filters.channel || 'all');
  
  const { data, isLoading, error, mutate } = useSalesReport({
    period,
    channel: selectedChannel,
    from: filters.from,
    to: filters.to,
  });

  const handleCreateMission = async (insight: any) => {
    try {
      const response = await fetch('/api/missions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module: 'reports',
          title: insight.title,
          summary: insight.description,
          priority: insight.priority,
          tags: ['sales', 'report', 'insight'],
          payload: {
            insight_type: insight.type,
            report_type: 'sales',
            recommendation: insight.recommendation,
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to create mission');
      
      // TODO: Show success toast
      console.log('Mission created for insight:', insight.title);
    } catch (error) {
      console.error('Failed to create mission:', error);
      // TODO: Show error toast
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getVariationIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getVariationColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-400';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>Erro ao carregar relatório de vendas</p>
            <Button variant="outline" onClick={() => mutate()} className="mt-2">
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const { summary, daily_data, channel_performance, insights } = data;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center space-x-4">
        <Select value={selectedChannel} onValueChange={setSelectedChannel}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Selecionar canal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os canais</SelectItem>
            <SelectItem value="meli">Mercado Livre</SelectItem>
            <SelectItem value="shopee">Shopee</SelectItem>
            <SelectItem value="amazon">Amazon</SelectItem>
            <SelectItem value="site">Site Próprio</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Receita Bruta</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.gross_revenue)}</p>
                <div className="flex items-center space-x-1 mt-1">
                  {getVariationIcon(summary.revenue_growth)}
                  <span className={cn('text-sm', getVariationColor(summary.revenue_growth))}>
                    {formatPercent(Math.abs(summary.revenue_growth))}
                  </span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Pedidos</p>
                <p className="text-2xl font-bold">{summary.total_orders.toLocaleString()}</p>
                <div className="flex items-center space-x-1 mt-1">
                  {getVariationIcon(summary.orders_growth)}
                  <span className={cn('text-sm', getVariationColor(summary.orders_growth))}>
                    {formatPercent(Math.abs(summary.orders_growth))}
                  </span>
                </div>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ticket Médio</p>
                <p className="text-2xl font-bold">{formatCurrency(summary.avg_ticket)}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <span className="text-sm text-muted-foreground">
                    vs período anterior
                  </span>
                </div>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Margem Bruta</p>
                <p className="text-2xl font-bold">{formatPercent(summary.margin_percent)}</p>
                <div className="flex items-center space-x-1 mt-1">
                  {getVariationIcon(summary.profit_growth)}
                  <span className={cn('text-sm', getVariationColor(summary.profit_growth))}>
                    {formatPercent(Math.abs(summary.profit_growth))}
                  </span>
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução da Receita</CardTitle>
          <CardDescription>Receita diária no período selecionado</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={daily_data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="day" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
              />
              <YAxis tickFormatter={(value) => formatCurrency(value, true)} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                formatter={(value: number) => [formatCurrency(value), 'Receita']}
              />
              <Area 
                type="monotone" 
                dataKey="gross_revenue" 
                stroke="#10B981" 
                fill="#10B981" 
                fillOpacity={0.1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Channel Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance por Canal</CardTitle>
            <CardDescription>Receita e margem por canal de vendas</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Canal</TableHead>
                  <TableHead className="text-right">Receita</TableHead>
                  <TableHead className="text-right">Pedidos</TableHead>
                  <TableHead className="text-right">Margem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {channel_performance.map((channel: any) => (
                  <TableRow key={channel.channel}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: CHANNEL_COLORS[channel.channel as keyof typeof CHANNEL_COLORS] || CHANNEL_COLORS.unknown }}
                        />
                        <span className="capitalize">{channel.channel}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(channel.gross_revenue)}
                    </TableCell>
                    <TableCell className="text-right">
                      {channel.total_orders.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={channel.margin_percent > 20 ? 'default' : 'secondary'}>
                        {formatPercent(channel.margin_percent)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Receita</CardTitle>
            <CardDescription>Participação de cada canal na receita total</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={channel_performance}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="gross_revenue"
                  nameKey="channel"
                  label={({ channel, percent }) => `${channel}: ${(percent * 100).toFixed(1)}%`}
                >
                  {channel_performance.map((entry: any, index: number) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={CHANNEL_COLORS[entry.channel as keyof typeof CHANNEL_COLORS] || CHANNEL_COLORS.unknown}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      {insights && insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Insights IA</CardTitle>
            <CardDescription>Análises automáticas e recomendações acionáveis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.map((insight: any, index: number) => (
                <div 
                  key={index}
                  className={cn('p-4 rounded-lg border', getInsightColor(insight.type))}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <h4 className="font-medium">{insight.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {insight.description}
                        </p>
                        <p className="text-sm font-medium mt-2">
                          💡 {insight.recommendation}
                        </p>
                      </div>
                    </div>
                    {insight.action === 'create_mission' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleCreateMission(insight)}
                      >
                        <Target className="h-4 w-4 mr-2" />
                        Criar Missão
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
