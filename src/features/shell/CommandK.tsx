/**
 * Command K - Busca e atalhos do aplicativo
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  LayoutDashboard,
  Calendar,
  BarChart3,
  MessageSquare,
  TrendingUp,
  Megaphone,
  Package,
  FileText,
  Settings,
  Command,
  Hash,
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { useRBAC } from '@/hooks/useRBAC';
import { cn } from '@/lib/utils';

interface CommandKProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const navigationCommands = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    subtitle: 'Visão geral do negócio',
    href: '/app',
    icon: LayoutDashboard,
    keywords: ['dashboard', 'home', 'inicio', 'visao geral'],
    roles: ['admin', 'manager', 'operator', 'viewer'],
  },
  {
    id: 'planning',
    title: 'Planning',
    subtitle: 'Metas, Orçamento & Calendário',
    href: '/app/planning',
    icon: Calendar,
    keywords: ['planning', 'metas', 'orcamento', 'calendario', 'planejamento'],
    roles: ['admin', 'manager', 'operator'],
  },
  {
    id: 'bi',
    title: 'BI Inteligente',
    subtitle: 'Analytics & Insights',
    href: '/app/bi',
    icon: BarChart3,
    keywords: ['bi', 'analytics', 'insights', 'relatorios', 'graficos'],
    roles: ['admin', 'manager', 'operator', 'viewer'],
  },
  {
    id: 'chat',
    title: 'Chat 360',
    subtitle: 'Atendimento Unificado',
    href: '/app/chat',
    icon: MessageSquare,
    keywords: ['chat', 'atendimento', 'mensagens', 'suporte'],
    roles: ['admin', 'manager', 'operator'],
  },
  {
    id: 'market',
    title: 'Market Intelligence',
    subtitle: 'Análise de Mercado',
    href: '/app/market',
    icon: TrendingUp,
    keywords: ['market', 'mercado', 'inteligencia', 'concorrencia'],
    roles: ['admin', 'manager', 'operator', 'viewer'],
  },
  {
    id: 'ads',
    title: 'Ads & Marketing',
    subtitle: 'Campanhas & Performance',
    href: '/app/ads',
    icon: Megaphone,
    keywords: ['ads', 'marketing', 'campanhas', 'anuncios'],
    roles: ['admin', 'manager', 'operator'],
  },
  {
    id: 'operations',
    title: 'Operações',
    subtitle: 'Estoque & Logística',
    href: '/app/operations',
    icon: Package,
    keywords: ['operacoes', 'estoque', 'logistica', 'produtos'],
    roles: ['admin', 'manager', 'operator'],
  },
  {
    id: 'reports',
    title: 'Relatórios',
    subtitle: 'Relatórios Customizados',
    href: '/app/reports',
    icon: FileText,
    keywords: ['relatorios', 'reports', 'customizados'],
    roles: ['admin', 'manager', 'operator', 'viewer'],
  },
  {
    id: 'settings',
    title: 'Configurações',
    subtitle: 'Empresa, Integrações & Usuários',
    href: '/app/settings',
    icon: Settings,
    keywords: ['configuracoes', 'settings', 'empresa', 'integracoes', 'usuarios'],
    roles: ['admin', 'manager'],
  },
];

const quickActions = [
  {
    id: 'new-mission',
    title: 'Nova Missão',
    subtitle: 'Criar uma nova missão IA',
    action: () => console.log('Nova missão'),
    icon: Command,
    keywords: ['nova', 'missao', 'ia', 'criar'],
    roles: ['admin', 'manager', 'operator'],
  },
  {
    id: 'sync-integrations',
    title: 'Sincronizar Integrações',
    subtitle: 'Forçar sync de todas as integrações',
    action: () => console.log('Sync integrações'),
    icon: Hash,
    keywords: ['sync', 'sincronizar', 'integracoes'],
    roles: ['admin', 'manager'],
  },
];

export function CommandK({ open, onOpenChange }: CommandKProps) {
  const [search, setSearch] = useState('');
  const router = useRouter();
  const { canAccess } = useRBAC();

  // Filter commands based on user permissions
  const filteredNavigation = navigationCommands.filter(command => 
    canAccess(command.href, command.roles)
  );

  const filteredActions = quickActions.filter(action => 
    canAccess('', action.roles)
  );

  // Handle navigation
  const handleNavigate = useCallback((href: string) => {
    router.push(href);
    onOpenChange(false);
    setSearch('');
  }, [router, onOpenChange]);

  // Handle action
  const handleAction = useCallback((action: () => void) => {
    action();
    onOpenChange(false);
    setSearch('');
  }, [onOpenChange]);

  // Filter items based on search
  const filteredNavigationItems = filteredNavigation.filter(item =>
    search === '' ||
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.subtitle.toLowerCase().includes(search.toLowerCase()) ||
    item.keywords.some(keyword => keyword.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredActionItems = filteredActions.filter(item =>
    search === '' ||
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.subtitle.toLowerCase().includes(search.toLowerCase()) ||
    item.keywords.some(keyword => keyword.toLowerCase().includes(search.toLowerCase()))
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Buscar páginas, ações..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Search className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Nenhum resultado encontrado para "{search}"
            </p>
          </div>
        </CommandEmpty>

        {filteredNavigationItems.length > 0 && (
          <CommandGroup heading="Navegação">
            {filteredNavigationItems.map((item) => (
              <CommandItem
                key={item.id}
                value={`${item.title} ${item.subtitle} ${item.keywords.join(' ')}`}
                onSelect={() => handleNavigate(item.href)}
                className="flex items-center space-x-3 px-3 py-2"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                  <item.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  Página
                </Badge>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filteredActionItems.length > 0 && (
          <>
            {filteredNavigationItems.length > 0 && <CommandSeparator />}
            <CommandGroup heading="Ações Rápidas">
              {filteredActionItems.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.title} ${item.subtitle} ${item.keywords.join(' ')}`}
                  onSelect={() => handleAction(item.action)}
                  className="flex items-center space-x-3 px-3 py-2"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Ação
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {search && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Atalhos">
              <CommandItem className="flex items-center space-x-3 px-3 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                  <Search className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Buscar por "{search}"</p>
                  <p className="text-xs text-muted-foreground">Busca global no sistema</p>
                </div>
                <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 inline-flex">
                  Enter
                </kbd>
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
