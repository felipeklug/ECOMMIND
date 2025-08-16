/**
 * Review Step Component
 * Final review and confirmation of onboarding settings
 */

'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Database,
  ShoppingCart,
  Calculator,
  Target,
  BarChart3,
  Package,
  TrendingUp,
  Zap,
  FileText,
  Shield,
  Rocket
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { 
  ConnectionsStep, 
  PreferencesStep, 
  ReviewStep as ReviewData 
} from '@/features/onboarding/schemas';
import { providerDisplayNames } from '@/features/onboarding/schemas';

interface ReviewStepProps {
  connectionsData: ConnectionsStep;
  preferencesData: PreferencesStep;
  data: ReviewData;
  onChange: (data: ReviewData) => void;
  errors: Record<string, any>;
}

export function ReviewStep({ 
  connectionsData, 
  preferencesData, 
  data, 
  onChange, 
  errors 
}: ReviewStepProps) {
  const channelNames = {
    meli: 'Mercado Livre',
    shopee: 'Shopee',
    amazon: 'Amazon',
    site: 'Site Próprio',
  };

  const updateData = (updates: Partial<ReviewData>) => {
    onChange({ ...data, ...updates });
  };

  // Mock connection statuses for demo
  const connectionStatuses = {
    [connectionsData.erp]: 'connected',
    ...Object.fromEntries(connectionsData.channels.map(channel => [channel, 'pending'])),
    site: 'connected', // Site próprio sempre conectado
  };

  const connectedCount = Object.values(connectionStatuses).filter(status => status === 'connected').length;
  const pendingCount = Object.values(connectionStatuses).filter(status => status === 'pending').length;

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Database className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">ERP</p>
                <p className="font-semibold text-blue-900 dark:text-blue-100">
                  {providerDisplayNames[connectionsData.erp]}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Canais</p>
                <p className="font-semibold text-green-900 dark:text-green-100">
                  {connectionsData.channels.length} selecionados
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">Conectados</p>
                <p className="font-semibold text-purple-900 dark:text-purple-100">
                  {connectedCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">Pendentes</p>
                <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                  {pendingCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connections Review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            Conexões Configuradas
          </CardTitle>
          <CardDescription>
            Revisão das integrações selecionadas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ERP */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium">{providerDisplayNames[connectionsData.erp]}</p>
                <p className="text-sm text-gray-500">Sistema ERP</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <CheckCircle className="w-3 h-3 mr-1" />
              Conectado
            </Badge>
          </div>

          {/* Channels */}
          <div className="space-y-2">
            {connectionsData.channels.map(channel => (
              <div key={channel} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium">{channelNames[channel]}</p>
                    <p className="text-sm text-gray-500">Canal de vendas</p>
                  </div>
                </div>
                <Badge 
                  variant="secondary" 
                  className={cn(
                    connectionStatuses[channel] === 'connected'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  )}
                >
                  {connectionStatuses[channel] === 'connected' ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Conectado
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3 mr-1" />
                      Pendente
                    </>
                  )}
                </Badge>
              </div>
            ))}
          </div>

          {pendingCount > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                    Conexões Pendentes
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-300">
                    Você pode finalizar o onboarding e conectar os canais pendentes depois. 
                    Criaremos missões para lembrar você de completar as integrações.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preferences Review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-green-600" />
            Preferências Configuradas
          </CardTitle>
          <CardDescription>
            Resumo das suas configurações de negócio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Fiscal */}
          <div className="flex items-center gap-4">
            <Calculator className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <p className="font-medium">Regime Fiscal</p>
              <p className="text-sm text-gray-500">
                {preferencesData.fiscal.isSimples 
                  ? `Simples Nacional - ${preferencesData.fiscal.aliquota}%`
                  : preferencesData.fiscal.regime || 'Outro regime'
                }
              </p>
            </div>
          </div>

          <Separator />

          {/* Margins */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              <p className="font-medium">Margens Alvo</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(preferencesData.marginTargets).map(([channel, margin]) => (
                <div key={channel} className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {channelNames[channel as keyof typeof channelNames]}
                  </p>
                  <p className="font-semibold text-lg">{margin}%</p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* ABC Curve */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <p className="font-medium">Curva ABC</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(preferencesData.abcCurve).map(([segment, percentage]) => (
                <div key={segment} className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Classe {segment}</p>
                  <p className="font-semibold text-lg">{Math.round(percentage * 100)}%</p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Market Scope */}
          <div className="flex items-center gap-4">
            <TrendingUp className="w-5 h-5 text-pink-600" />
            <div className="flex-1">
              <p className="font-medium">Market Intelligence</p>
              <p className="text-sm text-gray-500">
                {preferencesData.marketScope === 'niche' ? 'Foco no nicho atual' : 'Análise de categoria ampla'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-indigo-600" />
            Opções Finais
          </CardTitle>
          <CardDescription>
            Configure as ações iniciais do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-3">
            <Switch
              id="backfill"
              checked={data.enableBackfill}
              onCheckedChange={(checked) => updateData({ enableBackfill: checked })}
            />
            <div className="flex-1">
              <Label htmlFor="backfill" className="font-medium cursor-pointer">
                Executar backfill de dados
              </Label>
              <p className="text-sm text-gray-500">
                Importar histórico de pedidos dos últimos 90 dias para análise completa
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Switch
              id="missions"
              checked={data.createSeedMissions}
              onCheckedChange={(checked) => updateData({ createSeedMissions: checked })}
            />
            <div className="flex-1">
              <Label htmlFor="missions" className="font-medium cursor-pointer">
                Criar missões iniciais
              </Label>
              <p className="text-sm text-gray-500">
                Gerar tarefas automáticas para configurar metas e otimizar operações
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms"
              checked={data.acceptTerms}
              onCheckedChange={(checked) => updateData({ acceptTerms: checked as boolean })}
            />
            <div className="flex-1">
              <Label htmlFor="terms" className="font-medium cursor-pointer">
                Aceito os termos de uso e política de privacidade
              </Label>
              <p className="text-sm text-gray-500">
                Li e concordo com os{' '}
                <a href="/terms" className="text-blue-600 hover:underline">
                  termos de uso
                </a>{' '}
                e{' '}
                <a href="/privacy" className="text-blue-600 hover:underline">
                  política de privacidade
                </a>
              </p>
            </div>
          </div>

          {errors.acceptTerms && (
            <p className="text-sm text-red-600">{errors.acceptTerms}</p>
          )}
        </CardContent>
      </Card>

      {/* Next Steps Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Próximos Passos
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-300">1</span>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Explore o Dashboard</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Familiarize-se com as funcionalidades disponíveis
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-green-600 dark:text-green-300">2</span>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Complete as Missões</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Execute as tarefas criadas automaticamente
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-purple-600 dark:text-purple-300">3</span>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Conecte os Canais</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Finalize as integrações pendentes
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
