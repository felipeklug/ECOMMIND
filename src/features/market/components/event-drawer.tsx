/**
 * Event Drawer Component
 * Shows event details and allows creating missions
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Calendar,
  Target,
  Edit,
  Trash2,
  ExternalLink,
  Clock,
  Tag,
  Building,
  Sparkles,
  CheckSquare,
  Copy,
  VolumeX,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  channel: string | null;
  category: string | null;
  importance: 'low' | 'medium' | 'high';
  source: 'seed' | 'manual' | 'upload';
  metadata: Record<string, any>;
  created_at: string;
}

interface EventDrawerProps {
  event: CalendarEvent;
  open: boolean;
  onClose: () => void;
  onCreateMission: (event: CalendarEvent) => void;
  onRefresh: () => void;
}

function getImportanceColor(importance: string) {
  switch (importance) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

function getChannelInfo(channel: string | null) {
  if (!channel) {
    return { name: 'Global', icon: '🌐', color: 'bg-purple-100 text-purple-800' };
  }

  const channels = {
    meli: { name: 'Mercado Livre', icon: '🛒', color: 'bg-yellow-100 text-yellow-800' },
    shopee: { name: 'Shopee', icon: '🛍️', color: 'bg-orange-100 text-orange-800' },
    amazon: { name: 'Amazon', icon: '📦', color: 'bg-blue-100 text-blue-800' },
    site: { name: 'Site Próprio', icon: '🌐', color: 'bg-green-100 text-green-800' },
  };

  return channels[channel as keyof typeof channels] || { 
    name: channel, 
    icon: '📱', 
    color: 'bg-gray-100 text-gray-800' 
  };
}

function getSourceInfo(source: string) {
  const sources = {
    seed: { name: 'Sistema', icon: '🤖', description: 'Evento padrão do sistema' },
    manual: { name: 'Manual', icon: '✏️', description: 'Criado manualmente' },
    upload: { name: 'Importado', icon: '📤', description: 'Importado via CSV/JSON' },
  };

  return sources[source as keyof typeof sources] || { 
    name: source, 
    icon: '❓', 
    description: 'Origem desconhecida' 
  };
}

export function EventDrawer({ 
  event, 
  open, 
  onClose, 
  onCreateMission, 
  onRefresh 
}: EventDrawerProps) {
  const [isCreatingMission, setIsCreatingMission] = useState(false);

  const channelInfo = getChannelInfo(event.channel);
  const sourceInfo = getSourceInfo(event.source);
  const eventDate = new Date(event.date);

  const handleCreateMission = async () => {
    setIsCreatingMission(true);
    try {
      await onCreateMission(event);
      onRefresh();
    } catch (error) {
      console.error('Failed to create mission:', error);
    } finally {
      setIsCreatingMission(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {event.title}
          </SheetTitle>
          <SheetDescription>
            Detalhes do evento e ações disponíveis
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Event Info */}
          <div className="space-y-4">
            {/* Date */}
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {format(eventDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(eventDate, 'dd/MM/yyyy')}
                </p>
              </div>
            </div>

            {/* Channel */}
            <div className="flex items-center gap-3">
              <Building className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={cn('text-xs', channelInfo.color)}>
                  {channelInfo.icon} {channelInfo.name}
                </Badge>
              </div>
            </div>

            {/* Category */}
            {event.category && (
              <div className="flex items-center gap-3">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline" className="text-xs">
                  {event.category}
                </Badge>
              </div>
            )}

            {/* Importance */}
            <div className="flex items-center gap-3">
              <Target className="h-4 w-4 text-muted-foreground" />
              <Badge className={cn('text-xs', getImportanceColor(event.importance))}>
                {event.importance === 'high' && '🔴 Alta Prioridade'}
                {event.importance === 'medium' && '🟡 Média Prioridade'}
                {event.importance === 'low' && '🟢 Baixa Prioridade'}
              </Badge>
            </div>
          </div>

          {/* Metadata */}
          {event.metadata && Object.keys(event.metadata).length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Informações Adicionais</h4>
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                {event.metadata.description && (
                  <div>
                    <p className="text-xs text-muted-foreground">Descrição</p>
                    <p className="text-sm">{event.metadata.description}</p>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{sourceInfo.icon}</span>
                  <span>{sourceInfo.name}</span>
                  <span>•</span>
                  <span>{sourceInfo.description}</span>
                </div>

                <div className="text-xs text-muted-foreground">
                  Criado em {format(new Date(event.created_at), 'dd/MM/yyyy HH:mm')}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Ações</h4>
            
            <div className="space-y-2">
              <Button 
                onClick={handleCreateMission}
                disabled={isCreatingMission}
                className="w-full"
              >
                <Target className="h-4 w-4 mr-2" />
                {isCreatingMission ? 'Criando Missão...' : 'Criar Missão'}
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>

                <Button variant="outline" size="sm">
                  <VolumeX className="h-4 w-4 mr-2" />
                  Silenciar
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicar
                </Button>

                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
              </div>

              {event.source === 'manual' && (
                <Button variant="destructive" size="sm" className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Evento
                </Button>
              )}
            </div>
          </div>

          {/* Campaign Template */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Template de Campanha IA
            </h4>
            <div className="bg-muted/30 rounded-lg p-3 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Título Sugerido</p>
                <p className="font-medium text-sm">
                  🔥 {event.title} chegou! Ofertas imperdíveis
                  {event.channel && ` no ${channelInfo.name}`}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Copy Principal</p>
                <p className="text-sm">
                  Aproveite o {event.title} com descontos especiais!
                  {event.category && ` Produtos de ${event.category} com até 50% OFF.`}
                  Não perca essa oportunidade única!
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">CTA Recomendado</p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    "Comprar Agora"
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    "Ver Ofertas"
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Checklist de Preparação
            </h4>
            <div className="space-y-2">
              {[
                { task: 'Verificar estoque dos produtos principais', priority: 'high' },
                { task: 'Ajustar preços e margens', priority: 'high' },
                { task: 'Criar anúncios promocionais', priority: 'medium' },
                { task: 'Preparar creativos (banners, fotos)', priority: 'medium' },
                { task: 'Configurar logística e prazos', priority: 'medium' },
                { task: 'Agendar posts nas redes sociais', priority: 'low' },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="rounded" />
                  <span className={cn(
                    item.priority === 'high' ? 'text-red-600' :
                    item.priority === 'medium' ? 'text-yellow-600' :
                    'text-green-600'
                  )}>
                    {item.task}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Mission Preview */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Prévia da Missão</h4>
            <div className="bg-muted/30 rounded-lg p-3 border-l-4 border-primary">
              <p className="font-medium text-sm">
                Planejar campanha: {event.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Preparar estratégia de marketing e vendas para {event.title}
                {event.channel && ` no canal ${channelInfo.name}`}
                {event.category && ` na categoria ${event.category}`}.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  📅 Planejamento
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {event.importance === 'high' ? 'P1' : event.importance === 'medium' ? 'P2' : 'P3'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
