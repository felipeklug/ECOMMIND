/**
 * Connections Step Component
 * ERP and sales channel selection with connection status
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  ExternalLink, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Zap,
  ShoppingCart,
  Database,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ConnectionsStep, ERPProvider, SalesChannel } from '@/features/onboarding/schemas';
import { providerDisplayNames, channelColors } from '@/features/onboarding/schemas';

interface ConnectionsStepProps {
  data: ConnectionsStep;
  onChange: (data: ConnectionsStep) => void;
  errors: Record<string, any>;
}

const erpProviders = [
  {
    id: 'bling' as ERPProvider,
    name: 'Bling ERP',
    description: 'Sistema completo de gestão empresarial',
    icon: <Database className="w-6 h-6" />,
    features: ['Gestão de estoque', 'Controle financeiro', 'Relatórios avançados'],
    popular: true,
  },
  {
    id: 'tiny' as ERPProvider,
    name: 'Tiny ERP',
    description: 'ERP simples e eficiente para pequenas empresas',
    icon: <Database className="w-6 h-6" />,
    features: ['Fácil de usar', 'Integração rápida', 'Suporte dedicado'],
    popular: false,
  },
];

const salesChannels = [
  {
    id: 'meli' as SalesChannel,
    name: 'Mercado Livre',
    description: 'Maior marketplace da América Latina',
    icon: <ShoppingCart className="w-6 h-6" />,
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    popular: true,
  },
  {
    id: 'shopee' as SalesChannel,
    name: 'Shopee',
    description: 'Marketplace em crescimento no Brasil',
    icon: <ShoppingCart className="w-6 h-6" />,
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    popular: true,
  },
  {
    id: 'amazon' as SalesChannel,
    name: 'Amazon',
    description: 'Marketplace global com FBA',
    icon: <ShoppingCart className="w-6 h-6" />,
    color: 'bg-gray-900',
    textColor: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    popular: false,
  },
  {
    id: 'site' as SalesChannel,
    name: 'Site Próprio',
    description: 'Sua loja virtual independente',
    icon: <Globe className="w-6 h-6" />,
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    popular: false,
  },
];

export function ConnectionsStep({ data, onChange, errors }: ConnectionsStepProps) {
  const [connectionStatuses, setConnectionStatuses] = useState<Record<string, 'connected' | 'pending' | 'error'>>({
    bling: 'pending',
    tiny: 'pending',
    meli: 'pending',
    shopee: 'pending',
    amazon: 'pending',
    site: 'connected', // Site próprio sempre conectado
  });

  const handleERPChange = (erp: ERPProvider) => {
    onChange({
      ...data,
      erp,
    });
  };

  const handleChannelChange = (channel: SalesChannel, checked: boolean) => {
    const newChannels = checked
      ? [...data.channels, channel]
      : data.channels.filter(c => c !== channel);
    
    onChange({
      ...data,
      channels: newChannels,
    });
  };

  const handleConnect = async (provider: string) => {
    setConnectionStatuses(prev => ({
      ...prev,
      [provider]: 'pending',
    }));

    try {
      // TODO: Implement actual connection logic
      // For now, simulate connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setConnectionStatuses(prev => ({
        ...prev,
        [provider]: 'connected',
      }));
    } catch (error) {
      setConnectionStatuses(prev => ({
        ...prev,
        [provider]: 'error',
      }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="secondary" className="bg-green-100 text-green-700">Conectado</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Pendente</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      default:
        return <Badge variant="outline">Não conectado</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* ERP Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          1. Escolha seu ERP
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Selecione o sistema de gestão que você utiliza para sincronizar produtos, estoque e pedidos.
        </p>

        <RadioGroup
          value={data.erp}
          onValueChange={handleERPChange}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {erpProviders.map((provider) => (
            <motion.div
              key={provider.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Label
                htmlFor={provider.id}
                className={cn(
                  'relative flex cursor-pointer rounded-xl border-2 p-6 transition-all',
                  'hover:border-blue-300 hover:bg-blue-50/50',
                  'dark:hover:border-blue-600 dark:hover:bg-blue-900/20',
                  data.erp === provider.id
                    ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/30'
                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                )}
              >
                <RadioGroupItem
                  value={provider.id}
                  id={provider.id}
                  className="sr-only"
                />
                
                <div className="flex items-start space-x-4 w-full">
                  <div className={cn(
                    'p-3 rounded-lg',
                    data.erp === provider.id
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  )}>
                    {provider.icon}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {provider.name}
                      </h4>
                      {provider.popular && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                          Popular
                        </Badge>
                      )}
                      {getStatusBadge(connectionStatuses[provider.id])}
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {provider.description}
                    </p>
                    
                    <ul className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
                      {provider.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {data.erp === provider.id && connectionStatuses[provider.id] !== 'connected' && (
                      <Button
                        onClick={() => handleConnect(provider.id)}
                        disabled={connectionStatuses[provider.id] === 'pending'}
                        size="sm"
                        className="mt-3 gap-2"
                      >
                        {connectionStatuses[provider.id] === 'pending' ? (
                          <>
                            <Clock className="w-4 h-4 animate-pulse" />
                            Conectando...
                          </>
                        ) : (
                          <>
                            <ExternalLink className="w-4 h-4" />
                            Conectar {provider.name}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </Label>
            </motion.div>
          ))}
        </RadioGroup>

        {errors.erp && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-2">
            {errors.erp}
          </p>
        )}
      </div>

      {/* Sales Channels Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          2. Selecione seus canais de venda
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Escolha os marketplaces e canais onde você vende seus produtos.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {salesChannels.map((channel) => (
            <motion.div
              key={channel.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Label
                htmlFor={`channel-${channel.id}`}
                className={cn(
                  'relative flex cursor-pointer rounded-xl border-2 p-6 transition-all',
                  'hover:border-blue-300 hover:bg-blue-50/50',
                  'dark:hover:border-blue-600 dark:hover:bg-blue-900/20',
                  data.channels.includes(channel.id)
                    ? `border-blue-500 ${channel.bgColor} dark:border-blue-400 dark:bg-blue-900/30`
                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                )}
              >
                <div className="flex items-start space-x-4 w-full">
                  <div className={cn(
                    'p-3 rounded-lg',
                    data.channels.includes(channel.id)
                      ? `${channel.color} text-white`
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  )}>
                    {channel.icon}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Checkbox
                        id={`channel-${channel.id}`}
                        checked={data.channels.includes(channel.id)}
                        onCheckedChange={(checked) => 
                          handleChannelChange(channel.id, checked as boolean)
                        }
                      />
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {channel.name}
                      </h4>
                      {channel.popular && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                          Popular
                        </Badge>
                      )}
                      {getStatusBadge(connectionStatuses[channel.id])}
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {channel.description}
                    </p>

                    {data.channels.includes(channel.id) && connectionStatuses[channel.id] !== 'connected' && channel.id !== 'site' && (
                      <Button
                        onClick={() => handleConnect(channel.id)}
                        disabled={connectionStatuses[channel.id] === 'pending'}
                        size="sm"
                        variant="outline"
                        className="gap-2"
                      >
                        {connectionStatuses[channel.id] === 'pending' ? (
                          <>
                            <Clock className="w-4 h-4 animate-pulse" />
                            Conectando...
                          </>
                        ) : (
                          <>
                            <ExternalLink className="w-4 h-4" />
                            Conectar
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </Label>
            </motion.div>
          ))}
        </div>

        {errors.channels && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-2">
            {errors.channels}
          </p>
        )}
      </div>

      {/* Connection Summary */}
      {data.channels.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
              Resumo das Conexões
            </h4>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">ERP Selecionado</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {providerDisplayNames[data.erp]}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Canais</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {data.channels.length} selecionado{data.channels.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Conectados</p>
              <p className="font-medium text-green-600 dark:text-green-400">
                {Object.values(connectionStatuses).filter(s => s === 'connected').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pendentes</p>
              <p className="font-medium text-yellow-600 dark:text-yellow-400">
                {Object.values(connectionStatuses).filter(s => s === 'pending').length}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
