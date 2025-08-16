/**
 * Chat SLA Report Component
 * Placeholder for chat SLA analytics
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Clock, Users, Star } from 'lucide-react';

interface ChatSLAReportProps {
  period: string;
  filters: {
    from: string;
    to: string;
    agent: string;
  };
}

export function ChatSLAReport({ period, filters }: ChatSLAReportProps) {
  // TODO: Implement actual chat SLA report
  
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tempo Médio de Resposta</p>
                <p className="text-2xl font-bold">2.3 min</p>
                <Badge variant="default" className="mt-1">Meta: 3 min</Badge>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Resolução</p>
                <p className="text-2xl font-bold">94.2%</p>
                <Badge variant="default" className="mt-1">Meta: 90%</Badge>
              </div>
              <MessageSquare className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversas Ativas</p>
                <p className="text-2xl font-bold">23</p>
                <Badge variant="secondary" className="mt-1">Backlog</Badge>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Satisfação Média</p>
                <p className="text-2xl font-bold">4.7/5</p>
                <Badge variant="default" className="mt-1">Excelente</Badge>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder Content */}
      <Card>
        <CardHeader>
          <CardTitle>Relatório de Chat SLA</CardTitle>
          <CardDescription>
            Este relatório será implementado na próxima versão
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Em Desenvolvimento</h3>
            <p className="text-muted-foreground">
              O relatório detalhado de SLA do chat estará disponível em breve.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
