/**
 * Reports Dashboard Component
 * Main interface for all reports with tabs and filters
 */

'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  MessageSquare,
  DollarSign,
  Package,
  Target,
  Download,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { ChatSLAReport } from './chat-sla-report';
import { SalesReport } from './sales-report';
import { FinanceReport } from './finance-report';
import { OperationsReport } from './operations-report';
import { MissionsReport } from './missions-report';
import { ExportDialog } from './export-dialog';
import { cn } from '@/lib/utils';

interface ReportsDashboardProps {
  defaultTab?: string;
}

export function ReportsDashboard({ defaultTab = 'sales' }: ReportsDashboardProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [period, setPeriod] = useState('30d');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    channel: 'all',
    agent: 'all',
  });

  const tabs = [
    {
      id: 'sales',
      label: 'Vendas',
      icon: DollarSign,
      description: 'Receita, pedidos e margem por canal',
      color: 'text-green-600',
    },
    {
      id: 'chat',
      label: 'Chat SLA',
      icon: MessageSquare,
      description: 'Tempo de resposta e satisfação',
      color: 'text-blue-600',
    },
    {
      id: 'finance',
      label: 'Financeiro',
      icon: BarChart3,
      description: 'Fluxo de caixa e contas a pagar/receber',
      color: 'text-purple-600',
    },
    {
      id: 'operations',
      label: 'Operações',
      icon: Package,
      description: 'Estoque, ruptura e reposição',
      color: 'text-orange-600',
    },
    {
      id: 'missions',
      label: 'Missões',
      icon: Target,
      description: 'Produtividade e SLA de tarefas',
      color: 'text-red-600',
    },
  ];

  const periodOptions = [
    { value: '7d', label: 'Últimos 7 dias' },
    { value: '30d', label: 'Últimos 30 dias' },
    { value: '90d', label: 'Últimos 90 dias' },
    { value: 'custom', label: 'Período personalizado' },
  ];

  const handleExport = (format: 'pdf' | 'csv') => {
    // TODO: Implement export functionality
    console.log('Exporting', activeTab, 'as', format);
    setShowExportDialog(false);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios & Analytics</h1>
          <p className="text-muted-foreground">
            Insights executivos e métricas de performance
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-48">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={() => setShowExportDialog(true)}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Card 
              key={tab.id}
              className={cn(
                'cursor-pointer transition-all duration-200 hover:shadow-md',
                activeTab === tab.id && 'ring-2 ring-primary ring-offset-2'
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {tab.label}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-2xl font-bold">--</span>
                      {/* TODO: Add real-time metrics */}
                    </div>
                  </div>
                  <Icon className={cn('h-8 w-8', tab.color)} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Reports Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="flex items-center space-x-2"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span>Relatório de Vendas</span>
              </CardTitle>
              <CardDescription>
                Análise de receita, pedidos e margem por canal de vendas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SalesReport period={period} filters={filters} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <span>Relatório de SLA do Chat</span>
              </CardTitle>
              <CardDescription>
                Métricas de atendimento, tempo de resposta e satisfação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChatSLAReport period={period} filters={filters} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <span>Relatório Financeiro</span>
              </CardTitle>
              <CardDescription>
                Fluxo de caixa, contas a pagar e receber
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FinanceReport period={period} filters={filters} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-orange-600" />
                <span>Relatório de Operações</span>
              </CardTitle>
              <CardDescription>
                Estoque, ruptura, cobertura e reposição
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OperationsReport period={period} filters={filters} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="missions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-red-600" />
                <span>Relatório de Missões</span>
              </CardTitle>
              <CardDescription>
                Produtividade da equipe e SLA de tarefas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MissionsReport period={period} filters={filters} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Export Dialog */}
      <ExportDialog
        open={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        onExport={handleExport}
        reportType={activeTab}
        period={period}
        filters={filters}
      />
    </div>
  );
}
