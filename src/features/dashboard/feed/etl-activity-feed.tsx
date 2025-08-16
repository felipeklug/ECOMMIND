/**
 * ETL Activity Feed
 * Shows recent ETL runs and their status
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Database,
  Package,
  ShoppingCart,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { useEtlFeed } from '@/features/dashboard/hooks/use-etl-feed';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FeedSkeleton } from './feed-skeleton';
import { cn } from '@/lib/utils';

interface EtlRun {
  id: string;
  source: string;
  started_at: string;
  finished_at: string | null;
  ok: boolean;
  pages: number | null;
  rows: number | null;
  error: string | null;
  duration?: number;
}

function getSourceIcon(source: string) {
  if (source.includes('products')) return Package;
  if (source.includes('orders')) return ShoppingCart;
  return Database;
}

function getSourceLabel(source: string) {
  const labels: Record<string, string> = {
    'bling.products': 'Produtos Bling',
    'bling.orders': 'Pedidos Bling',
    'tiny.products': 'Produtos Tiny',
    'tiny.orders': 'Pedidos Tiny',
  };
  return labels[source] || source;
}

function formatDuration(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}min`;
}

export function EtlActivityFeed() {
  const { data, isLoading, error, mutate } = useEtlFeed();

  if (isLoading) {
    return <FeedSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Atividades ETL
          </CardTitle>
          <CardDescription>
            Últimas execuções de sincronização
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <div className="text-center">
              <p className="text-sm">Erro ao carregar atividades</p>
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
            <Activity className="h-5 w-5" />
            Atividades ETL
          </CardTitle>
          <CardDescription>
            Últimas execuções de sincronização
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <div className="text-center">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm font-medium">Nenhuma atividade registrada</p>
              <p className="text-xs mt-1">
                Execute uma sincronização para ver as atividades
              </p>
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
              <Activity className="h-5 w-5" />
              Atividades ETL
            </CardTitle>
            <CardDescription>
              Últimas execuções de sincronização
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => mutate()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((run: EtlRun) => {
            const SourceIcon = getSourceIcon(run.source);
            const isRunning = !run.finished_at;
            const duration = run.duration || (
              run.finished_at ? 
                new Date(run.finished_at).getTime() - new Date(run.started_at).getTime() :
                Date.now() - new Date(run.started_at).getTime()
            );

            return (
              <div key={run.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                {/* Icon */}
                <div className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full',
                  run.ok ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                  isRunning ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                  'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                )}>
                  {isRunning ? (
                    <Clock className="h-5 w-5 animate-pulse" />
                  ) : run.ok ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <XCircle className="h-5 w-5" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SourceIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">
                        {getSourceLabel(run.source)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={run.ok ? 'default' : isRunning ? 'secondary' : 'destructive'}
                        className="text-xs"
                      >
                        {isRunning ? 'Executando' : run.ok ? 'Sucesso' : 'Erro'}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-1 text-xs text-muted-foreground">
                    {run.ok && run.pages && run.rows ? (
                      <span>
                        {run.pages} página{run.pages !== 1 ? 's' : ''} • {run.rows} registro{run.rows !== 1 ? 's' : ''}
                      </span>
                    ) : run.error ? (
                      <span className="text-destructive">
                        {run.error.length > 50 ? `${run.error.substring(0, 50)}...` : run.error}
                      </span>
                    ) : isRunning ? (
                      <span>Sincronização em andamento...</span>
                    ) : (
                      <span>Execução sem dados</span>
                    )}
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {formatDistanceToNow(new Date(run.started_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </span>
                    {duration && (
                      <span>
                        {formatDuration(duration)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Mostrando últimas {data.length} execuções
            </div>
            <Button variant="link" size="sm" className="text-xs h-auto p-0">
              Ver histórico completo
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
