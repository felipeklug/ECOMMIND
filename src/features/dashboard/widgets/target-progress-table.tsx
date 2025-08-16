/**
 * Target Progress Table Widget
 * Shows top 5 targets progress for current month
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, Plus, ExternalLink } from 'lucide-react';
import { useTargetProgressTop } from '@/features/dashboard/hooks/use-target-progress-top';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { TableSkeleton } from './table-skeleton';
import { cn } from '@/lib/utils';

interface TargetProgressItem {
  sku: string;
  channel: string;
  revenueProgress: number;
  unitsProgress: number;
  targetRevenue: number;
  actualRevenue: number;
  targetUnits: number;
  actualUnits: number;
}

function getChannelBadge(channel: string) {
  const channelConfig = {
    meli: { label: 'ML', variant: 'default' as const, className: 'bg-yellow-100 text-yellow-800' },
    shopee: { label: 'Shopee', variant: 'secondary' as const, className: 'bg-orange-100 text-orange-800' },
    amazon: { label: 'Amazon', variant: 'outline' as const, className: 'bg-blue-100 text-blue-800' },
    site: { label: 'Site', variant: 'secondary' as const, className: 'bg-purple-100 text-purple-800' },
  };

  const config = channelConfig[channel as keyof typeof channelConfig] || {
    label: channel,
    variant: 'secondary' as const,
    className: 'bg-gray-100 text-gray-800'
  };

  return (
    <Badge variant={config.variant} className={cn('text-xs', config.className)}>
      {config.label}
    </Badge>
  );
}

function getProgressColor(progress: number) {
  if (progress >= 95) return 'bg-green-500';
  if (progress >= 70) return 'bg-yellow-500';
  return 'bg-red-500';
}

export function TargetProgressTable() {
  const { data, isLoading, error } = useTargetProgressTop();

  if (isLoading) {
    return <TableSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Metas do Mês
          </CardTitle>
          <CardDescription>
            Top 5 produtos por progresso de meta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <div className="text-center">
              <p className="text-sm">Erro ao carregar dados</p>
              <p className="text-xs mt-1">Tente novamente em alguns instantes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Metas do Mês
          </CardTitle>
          <CardDescription>
            Top 5 produtos por progresso de meta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <div className="text-center">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm font-medium">Nenhuma meta configurada</p>
              <p className="text-xs mt-1 mb-3">
                Configure metas para acompanhar o progresso
              </p>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Importar Metas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Metas do Mês
            </CardTitle>
            <CardDescription>
              Top 5 produtos por progresso de meta
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 text-xs font-medium text-muted-foreground border-b pb-2">
            <div className="col-span-3">SKU</div>
            <div className="col-span-2">Canal</div>
            <div className="col-span-3">% Receita</div>
            <div className="col-span-3">% Unidades</div>
            <div className="col-span-1">Status</div>
          </div>

          {/* Rows */}
          {data.map((item: TargetProgressItem, index) => (
            <div key={`${item.sku}-${item.channel}`} className="grid grid-cols-12 gap-4 items-center py-2 hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors">
              <div className="col-span-3">
                <div className="font-medium text-sm truncate" title={item.sku}>
                  {item.sku}
                </div>
              </div>
              
              <div className="col-span-2">
                {getChannelBadge(item.channel)}
              </div>
              
              <div className="col-span-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>{item.revenueProgress.toFixed(1)}%</span>
                    <span className="text-muted-foreground">
                      {formatCurrency(item.actualRevenue, true)} / {formatCurrency(item.targetRevenue, true)}
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(item.revenueProgress, 100)} 
                    className="h-2"
                  />
                </div>
              </div>
              
              <div className="col-span-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>{item.unitsProgress.toFixed(1)}%</span>
                    <span className="text-muted-foreground">
                      {formatNumber(item.actualUnits)} / {formatNumber(item.targetUnits)}
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(item.unitsProgress, 100)} 
                    className="h-2"
                  />
                </div>
              </div>
              
              <div className="col-span-1">
                <div 
                  className={cn(
                    'w-3 h-3 rounded-full',
                    getProgressColor(Math.min(item.revenueProgress, item.unitsProgress))
                  )}
                  title={
                    Math.min(item.revenueProgress, item.unitsProgress) >= 95 ? 'Meta atingida' :
                    Math.min(item.revenueProgress, item.unitsProgress) >= 70 ? 'No caminho certo' :
                    'Abaixo da meta'
                  }
                />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>≥95% Meta atingida</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span>70-95% No caminho</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span>&lt;70% Abaixo</span>
              </div>
            </div>
            <Button variant="link" size="sm" className="text-xs h-auto p-0">
              Ver todas as metas
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
