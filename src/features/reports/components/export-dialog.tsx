/**
 * Export Dialog Component
 * Dialog for exporting reports in PDF or CSV format
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Download,
  FileSpreadsheet,
  Calendar,
  Filter,
  Loader2,
} from 'lucide-react';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  onExport: (format: 'pdf' | 'csv') => void;
  reportType: string;
  period: string;
  filters: Record<string, any>;
}

export function ExportDialog({
  open,
  onClose,
  onExport,
  reportType,
  period,
  filters,
}: ExportDialogProps) {
  const [format, setFormat] = useState<'pdf' | 'csv'>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeInsights, setIncludeInsights] = useState(true);
  const [includeRawData, setIncludeRawData] = useState(false);

  const reportTypes = {
    sales: 'Vendas',
    chat: 'Chat SLA',
    finance: 'Financeiro',
    operations: 'Operações',
    missions: 'Missões',
  };

  const formatOptions = [
    {
      value: 'pdf',
      label: 'PDF',
      description: 'Relatório executivo formatado',
      icon: FileText,
      features: ['Gráficos', 'Insights IA', 'Branding'],
    },
    {
      value: 'csv',
      label: 'CSV',
      description: 'Dados brutos para análise',
      icon: FileSpreadsheet,
      features: ['Dados tabulares', 'Importação Excel', 'Análise personalizada'],
    },
  ];

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      await onExport(format);
    } catch (error) {
      console.error('Export failed:', error);
      // TODO: Show error toast
    } finally {
      setIsExporting(false);
    }
  };

  const getActiveFilters = () => {
    const activeFilters = [];
    
    if (filters.channel && filters.channel !== 'all') {
      activeFilters.push(`Canal: ${filters.channel}`);
    }
    
    if (filters.agent && filters.agent !== 'all') {
      activeFilters.push(`Agente: ${filters.agent}`);
    }
    
    if (filters.from && filters.to) {
      activeFilters.push(`Período: ${filters.from} - ${filters.to}`);
    } else {
      const periodLabels = {
        '7d': 'Últimos 7 dias',
        '30d': 'Últimos 30 dias',
        '90d': 'Últimos 90 dias',
      };
      activeFilters.push(`Período: ${periodLabels[period as keyof typeof periodLabels] || period}`);
    }
    
    return activeFilters;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Relatório
          </DialogTitle>
          <DialogDescription>
            Exporte o relatório de {reportTypes[reportType as keyof typeof reportTypes]} 
            nos formatos disponíveis
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Summary */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-3">Resumo do Relatório</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {reportTypes[reportType as keyof typeof reportTypes]}
                </Badge>
              </div>
              
              <div className="space-y-1">
                {getActiveFilters().map((filter, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Filter className="h-3 w-3" />
                    <span>{filter}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Format Selection */}
          <div className="space-y-3">
            <Label>Formato de Export</Label>
            <div className="grid grid-cols-2 gap-3">
              {formatOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <div
                    key={option.value}
                    className={`
                      relative cursor-pointer rounded-lg border p-4 transition-all
                      ${format === option.value 
                        ? 'border-primary bg-primary/5 ring-2 ring-primary ring-offset-2' 
                        : 'border-border hover:border-primary/50'
                      }
                    `}
                    onClick={() => setFormat(option.value as 'pdf' | 'csv')}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-6 w-6" />
                      <div>
                        <p className="font-medium">{option.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-1">
                        {option.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Export Options */}
          {format === 'pdf' && (
            <div className="space-y-3">
              <Label>Opções do PDF</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="include-charts" 
                    checked={includeCharts}
                    onCheckedChange={setIncludeCharts}
                  />
                  <Label htmlFor="include-charts" className="text-sm">
                    Incluir gráficos e visualizações
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="include-insights" 
                    checked={includeInsights}
                    onCheckedChange={setIncludeInsights}
                  />
                  <Label htmlFor="include-insights" className="text-sm">
                    Incluir insights e recomendações IA
                  </Label>
                </div>
              </div>
            </div>
          )}

          {format === 'csv' && (
            <div className="space-y-3">
              <Label>Opções do CSV</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="include-raw-data" 
                    checked={includeRawData}
                    onCheckedChange={setIncludeRawData}
                  />
                  <Label htmlFor="include-raw-data" className="text-sm">
                    Incluir dados brutos detalhados
                  </Label>
                </div>
              </div>
            </div>
          )}

          {/* File Preview */}
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Nome do arquivo:</span>
              <span className="font-medium">
                {reportType}-report-{new Date().toISOString().split('T')[0]}.{format}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Exportar {format.toUpperCase()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
