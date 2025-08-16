/**
 * Coming Soon Page for Disabled Modules
 * Shown when users try to access disabled features
 */

'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Clock, 
  Zap, 
  Star,
  BarChart3,
  Calendar,
  Target,
  MessageSquare,
  ShoppingCart,
  Bot
} from 'lucide-react';
import { getModuleDisplayName, type ModuleFlag } from '@/lib/flags';

function SoonContent() {
  const searchParams = useSearchParams();
  const moduleParam = searchParams.get('m') as ModuleFlag | null;
  
  if (!moduleParam) {
    return <div>Módulo não especificado</div>;
  }

  const moduleInfo = getModuleInfo(moduleParam);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                {moduleInfo.icon}
              </div>
              
              <Badge variant="secondary" className="mb-4">
                <Clock className="mr-1 h-3 w-3" />
                Em Desenvolvimento
              </Badge>
              
              <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {moduleInfo.title}
              </CardTitle>
              
              <CardDescription className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                {moduleInfo.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Features Preview */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  🚀 O que está chegando:
                </h3>
                <ul className="space-y-3">
                  {moduleInfo.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Timeline */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    Previsão de Lançamento
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  {moduleInfo.timeline}
                </p>
              </div>

              {/* CTA */}
              <div className="text-center pt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Quer ser notificado quando estiver pronto?
                </p>
                
                <div className="flex gap-3 justify-center">
                  <Link href="/dashboard">
                    <Button variant="outline">
                      Voltar ao Dashboard
                    </Button>
                  </Link>
                  
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Zap className="mr-2 h-4 w-4" />
                    Notificar-me
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function SoonPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <SoonContent />
    </Suspense>
  );
}

/**
 * Get module information for display
 */
function getModuleInfo(module: ModuleFlag) {
  const moduleData = {
    bi_v2: {
      title: 'Business Intelligence 2.0',
      description: 'Dashboards avançados com IA e insights preditivos para maximizar seus resultados.',
      icon: <BarChart3 className="h-8 w-8 text-white" />,
      features: [
        'Dashboards interativos com drill-down',
        'Análise preditiva de vendas',
        'Alertas inteligentes de performance',
        'Comparativos automáticos de períodos',
        'Exportação avançada de relatórios'
      ],
      timeline: 'Primeira quinzena de fevereiro de 2025'
    },
    planning_v1: {
      title: 'Planejamento Estratégico',
      description: 'Ferramentas completas para planejamento de metas, orçamentos e estratégias de crescimento.',
      icon: <Target className="h-8 w-8 text-white" />,
      features: [
        'Definição de metas por canal e produto',
        'Orçamento inteligente com IA',
        'Simulações de cenários',
        'Acompanhamento de KPIs',
        'Calendário comercial integrado'
      ],
      timeline: 'Final de janeiro de 2025'
    },
    ads_v1: {
      title: 'Gestão de Anúncios',
      description: 'Centralize e otimize todos os seus anúncios em uma única plataforma inteligente.',
      icon: <Zap className="h-8 w-8 text-white" />,
      features: [
        'Integração com Google Ads e Facebook',
        'Otimização automática de campanhas',
        'ROI em tempo real por produto',
        'Sugestões de palavras-chave',
        'Relatórios unificados de performance'
      ],
      timeline: 'Março de 2025'
    },
    ops_v1: {
      title: 'Operações',
      description: 'Automatize processos operacionais e ganhe eficiência em toda a cadeia.',
      icon: <ShoppingCart className="h-8 w-8 text-white" />,
      features: [
        'Automação de processos de fulfillment',
        'Gestão inteligente de estoque',
        'Integração com transportadoras',
        'Controle de qualidade automatizado',
        'Workflows personalizáveis'
      ],
      timeline: 'Abril de 2025'
    },
    market_v1: {
      title: 'Marketplace Intelligence',
      description: 'Domine todos os marketplaces com inteligência competitiva e otimização automática.',
      icon: <BarChart3 className="h-8 w-8 text-white" />,
      features: [
        'Monitoramento de concorrência',
        'Otimização automática de preços',
        'Análise de market share',
        'Alertas de oportunidades',
        'Benchmarking de performance'
      ],
      timeline: 'Maio de 2025'
    },
    chat360_v1: {
      title: 'Chat 360°',
      description: 'Atendimento omnichannel com IA para converter mais e encantar clientes.',
      icon: <MessageSquare className="h-8 w-8 text-white" />,
      features: [
        'Chatbot com IA avançada',
        'Integração WhatsApp Business',
        'Atendimento multicanal unificado',
        'Automação de vendas',
        'Analytics de conversação'
      ],
      timeline: 'Junho de 2025'
    },
    missions_v1: {
      title: 'Missões IA',
      description: 'IA que identifica oportunidades e cria tarefas automáticas para sua equipe.',
      icon: <Bot className="h-8 w-8 text-white" />,
      features: [
        'Detecção automática de oportunidades',
        'Criação inteligente de tarefas',
        'Priorização por impacto',
        'Acompanhamento de execução',
        'Relatórios de produtividade'
      ],
      timeline: 'Final de janeiro de 2025'
    }
  };

  return moduleData[module] || {
    title: getModuleDisplayName(module),
    description: 'Módulo em desenvolvimento.',
    icon: <Clock className="h-8 w-8 text-white" />,
    features: ['Funcionalidades em definição'],
    timeline: 'Em breve'
  };
}
