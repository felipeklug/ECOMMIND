/**
 * Missions Report Component
 * Placeholder for missions productivity analytics
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, CheckCircle, Clock, Users } from 'lucide-react';

interface MissionsReportProps {
  period: string;
  filters: {
    from: string;
    to: string;
    owner: string;
  };
}

export function MissionsReport({ period, filters }: MissionsReportProps) {
  // TODO: Implement actual missions report
  
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Missões Abertas</p>
                <p className="text-2xl font-bold">34</p>
                <Badge variant="secondary" className="mt-1">Ativas</Badge>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Concluídas</p>
                <p className="text-2xl font-bold">127</p>
                <Badge variant="default" className="mt-1">Este mês</Badge>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tempo Médio</p>
                <p className="text-2xl font-bold">2.3 dias</p>
                <Badge variant="outline" className="mt-1">Conclusão</Badge>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Equipe Ativa</p>
                <p className="text-2xl font-bold">8</p>
                <Badge variant="secondary" className="mt-1">Membros</Badge>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder Content */}
      <Card>
        <CardHeader>
          <CardTitle>Relatório de Missões</CardTitle>
          <CardDescription>
            Este relatório será implementado na próxima versão
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Em Desenvolvimento</h3>
            <p className="text-muted-foreground">
              O relatório detalhado de missões estará disponível em breve.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
