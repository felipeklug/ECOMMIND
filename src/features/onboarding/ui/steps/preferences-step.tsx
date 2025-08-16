/**
 * Preferences Step Component
 * Business preferences configuration including fiscal regime, margins, and ABC curve
 */

'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  Target, 
  TrendingUp, 
  Package, 
  Info,
  Percent,
  Calendar,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PreferencesStep, MarketScope } from '@/features/onboarding/schemas';

interface PreferencesStepProps {
  data: PreferencesStep;
  onChange: (data: PreferencesStep) => void;
  errors: Record<string, any>;
}

export function PreferencesStep({ data, onChange, errors }: PreferencesStepProps) {
  const updateFiscal = (updates: Partial<typeof data.fiscal>) => {
    onChange({
      ...data,
      fiscal: { ...data.fiscal, ...updates },
    });
  };

  const updateMarginTarget = (channel: keyof typeof data.marginTargets, value: number) => {
    onChange({
      ...data,
      marginTargets: {
        ...data.marginTargets,
        [channel]: value,
      },
    });
  };

  const updateABCCurve = (segment: keyof typeof data.abcCurve, value: number) => {
    onChange({
      ...data,
      abcCurve: {
        ...data.abcCurve,
        [segment]: value / 100, // Convert percentage to decimal
      },
    });
  };

  const updateCoverageDays = (channel: keyof typeof data.coverageDays, value: number) => {
    onChange({
      ...data,
      coverageDays: {
        ...data.coverageDays,
        [channel]: value,
      },
    });
  };

  const updateMarketScope = (scope: MarketScope) => {
    onChange({
      ...data,
      marketScope: scope,
    });
  };

  const updateCriticalSkuMargin = (value: number) => {
    onChange({
      ...data,
      criticalSkuMargin: value,
    });
  };

  return (
    <div className="space-y-8">
      {/* Fiscal Regime */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            Regime Fiscal
          </CardTitle>
          <CardDescription>
            Configure seu regime tributário para cálculos precisos de margem
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="simples"
              checked={data.fiscal.isSimples}
              onCheckedChange={(checked) => updateFiscal({ isSimples: checked })}
            />
            <Label htmlFor="simples" className="font-medium">
              Simples Nacional
            </Label>
          </div>

          {data.fiscal.isSimples ? (
            <div className="space-y-2">
              <Label htmlFor="aliquota">Alíquota do Simples (%)</Label>
              <div className="flex items-center space-x-4">
                <Slider
                  value={[data.fiscal.aliquota || 12]}
                  onValueChange={([value]) => updateFiscal({ aliquota: value })}
                  max={20}
                  min={4}
                  step={0.5}
                  className="flex-1"
                />
                <div className="w-16 text-center">
                  <Badge variant="outline">
                    {data.fiscal.aliquota || 12}%
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Faixa típica: 4% a 20% dependendo do faturamento
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="regime">Regime Tributário</Label>
              <Input
                id="regime"
                placeholder="Ex: Lucro Presumido, Lucro Real"
                value={data.fiscal.regime || ''}
                onChange={(e) => updateFiscal({ regime: e.target.value })}
              />
            </div>
          )}

          {errors.fiscal && (
            <p className="text-sm text-red-600">{errors.fiscal}</p>
          )}
        </CardContent>
      </Card>

      {/* Margin Targets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-green-600" />
            Margens Alvo por Canal
          </CardTitle>
          <CardDescription>
            Defina as margens de lucro desejadas para cada canal de venda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(data.marginTargets).map(([channel, margin]) => {
            const channelNames = {
              meli: 'Mercado Livre',
              shopee: 'Shopee',
              amazon: 'Amazon',
              site: 'Site Próprio',
            };

            const channelColors = {
              meli: 'text-yellow-600',
              shopee: 'text-orange-600',
              amazon: 'text-gray-600',
              site: 'text-blue-600',
            };

            return (
              <div key={channel} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className={cn('font-medium', channelColors[channel as keyof typeof channelColors])}>
                    {channelNames[channel as keyof typeof channelNames]}
                  </Label>
                  <Badge variant="outline" className="gap-1">
                    <Percent className="w-3 h-3" />
                    {margin}%
                  </Badge>
                </div>
                <Slider
                  value={[margin]}
                  onValueChange={([value]) => updateMarginTarget(channel as keyof typeof data.marginTargets, value)}
                  max={50}
                  min={5}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>5%</span>
                  <span>Margem recomendada: {channel === 'site' ? '18-25%' : channel === 'meli' ? '15-20%' : '12-18%'}</span>
                  <span>50%</span>
                </div>
              </div>
            );
          })}

          <div className="mt-6 space-y-2">
            <Label htmlFor="critical-margin">Margem Mínima para SKUs Críticos (%)</Label>
            <div className="flex items-center space-x-4">
              <Slider
                value={[data.criticalSkuMargin || 10]}
                onValueChange={([value]) => updateCriticalSkuMargin(value)}
                max={30}
                min={5}
                step={1}
                className="flex-1"
              />
              <div className="w-16 text-center">
                <Badge variant="outline">
                  {data.criticalSkuMargin || 10}%
                </Badge>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Margem mínima para produtos estratégicos ou de alto volume
            </p>
          </div>

          {errors.marginTargets && (
            <p className="text-sm text-red-600">{errors.marginTargets}</p>
          )}
        </CardContent>
      </Card>

      {/* ABC Curve */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Curva ABC
          </CardTitle>
          <CardDescription>
            Configure os limites da análise ABC para classificação de produtos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(data.abcCurve).map(([segment, percentage]) => {
              const segmentInfo = {
                A: { name: 'Classe A', color: 'text-green-600', desc: 'Alto valor' },
                B: { name: 'Classe B', color: 'text-yellow-600', desc: 'Médio valor' },
                C: { name: 'Classe C', color: 'text-red-600', desc: 'Baixo valor' },
              };

              const info = segmentInfo[segment as keyof typeof segmentInfo];

              return (
                <div key={segment} className="space-y-2">
                  <div className="text-center">
                    <Label className={cn('font-medium', info.color)}>
                      {info.name}
                    </Label>
                    <p className="text-xs text-gray-500">{info.desc}</p>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      {Math.round(percentage * 100)}%
                    </Badge>
                  </div>
                  <Slider
                    value={[percentage * 100]}
                    onValueChange={([value]) => updateABCCurve(segment as keyof typeof data.abcCurve, value)}
                    max={90}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                </div>
              );
            })}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Sobre a Curva ABC
                </p>
                <p className="text-blue-700 dark:text-blue-300">
                  A análise ABC classifica produtos por importância: Classe A (alta receita), 
                  Classe B (média receita), Classe C (baixa receita). Ajuste os percentuais 
                  conforme seu negócio.
                </p>
              </div>
            </div>
          </div>

          {errors.abcCurve && (
            <p className="text-sm text-red-600">{errors.abcCurve}</p>
          )}
        </CardContent>
      </Card>

      {/* Coverage Days */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600" />
            Cobertura de Estoque
          </CardTitle>
          <CardDescription>
            Defina os dias de cobertura ideais para cada canal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(data.coverageDays).map(([channel, days]) => {
            const channelNames = {
              meli_full: 'Mercado Livre (Full)',
              shopee_full: 'Shopee (Full)',
              amazon_fba: 'Amazon (FBA)',
              site_full: 'Site Próprio',
            };

            return (
              <div key={channel} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="font-medium">
                    {channelNames[channel as keyof typeof channelNames]}
                  </Label>
                  <Badge variant="outline" className="gap-1">
                    <Calendar className="w-3 h-3" />
                    {days} dias
                  </Badge>
                </div>
                <Slider
                  value={[days]}
                  onValueChange={([value]) => updateCoverageDays(channel as keyof typeof data.coverageDays, value)}
                  max={90}
                  min={7}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>7 dias</span>
                  <span>Recomendado: {channel.includes('amazon') ? '30-45 dias' : '21-30 dias'}</span>
                  <span>90 dias</span>
                </div>
              </div>
            );
          })}

          {errors.coverageDays && (
            <p className="text-sm text-red-600">{errors.coverageDays}</p>
          )}
        </CardContent>
      </Card>

      {/* Market Intelligence Scope */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-pink-600" />
            Escopo do Market Intelligence
          </CardTitle>
          <CardDescription>
            Escolha o foco da análise de mercado e oportunidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={data.marketScope}
            onValueChange={updateMarketScope}
            className="space-y-4"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={cn(
                'flex items-start space-x-3 rounded-lg border-2 p-4 transition-all',
                data.marketScope === 'niche'
                  ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/30'
                  : 'border-gray-200 dark:border-gray-700'
              )}
            >
              <RadioGroupItem value="niche" id="niche" className="mt-1" />
              <div className="space-y-1">
                <Label htmlFor="niche" className="font-medium cursor-pointer">
                  Nicho Atual
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Foco nos produtos e categorias que você já vende. Análise mais profunda 
                  do seu mercado específico com oportunidades de otimização.
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">Análise focada</Badge>
                  <Badge variant="secondary" className="text-xs">Otimização</Badge>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className={cn(
                'flex items-start space-x-3 rounded-lg border-2 p-4 transition-all',
                data.marketScope === 'category'
                  ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/30'
                  : 'border-gray-200 dark:border-gray-700'
              )}
            >
              <RadioGroupItem value="category" id="category" className="mt-1" />
              <div className="space-y-1">
                <Label htmlFor="category" className="font-medium cursor-pointer">
                  Categoria Ampla
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Análise de toda a categoria dos seus produtos. Identifica oportunidades 
                  de expansão e novos produtos para adicionar ao catálogo.
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">Expansão</Badge>
                  <Badge variant="secondary" className="text-xs">Novos produtos</Badge>
                </div>
              </div>
            </motion.div>
          </RadioGroup>

          {errors.marketScope && (
            <p className="text-sm text-red-600">{errors.marketScope}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
