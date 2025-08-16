/**
 * Finance Report Component
 * Placeholder for financial analytics
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Calendar, AlertTriangle } from 'lucide-react';

interface FinanceReportProps {
  period: string;
  filters: {
    from: string;
    to: string;
  };
}

export function FinanceReport({ period, filters }: FinanceReportProps) {
  // TODO: Implement actual finance report
  
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Saldo Atual</p>
                <p className="text-2xl font-bold">R$ 45.230</p>
                <Badge variant="default" className="mt-1">Positivo</Badge>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recebíveis 30d</p>
                <p className="text-2xl font-bold">R$ 89.450</p>
                <Badge variant="secondary" className="mt-1">Previsto</Badge>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">A Pagar 30d</p>
                <p className="text-2xl font-bold">R$ 34.120</p>
                <Badge variant="outline" className="mt-1">Programado</Badge>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Atraso</p>
                <p className="text-2xl font-bold">R$ 2.340</p>
                <Badge variant="destructive" className="mt-1">Atenção</Badge>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder Content */}
      <Card>
        <CardHeader>
          <CardTitle>Relatório Financeiro</CardTitle>
          <CardDescription>
            Este relatório será implementado na próxima versão
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Em Desenvolvimento</h3>
            <p className="text-muted-foreground">
              O relatório detalhado financeiro estará disponível em breve.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
