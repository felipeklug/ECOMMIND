/**
 * Ultra Premium Sidebar
 * Fixed sidebar with navigation and feature flags
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  LayoutDashboard,
  BarChart3,
  Target,
  Package,
  Megaphone,
  TrendingUp,
  MessageSquare,
  CheckSquare,
  Settings,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  flag?: string;
  description?: string;
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Visão geral dos KPIs',
  },
  {
    name: 'BI & Analytics',
    href: '/dashboard/bi',
    icon: BarChart3,
    flag: 'bi_v2',
    description: 'Relatórios e análises',
  },
  {
    name: 'Planning',
    href: '/dashboard/planning',
    icon: Target,
    flag: 'planning_v1',
    description: 'Metas e orçamento',
  },
  {
    name: 'Operações',
    href: '/dashboard/ops',
    icon: Package,
    flag: 'ops_v1',
    badge: 'Em breve',
    description: 'Estoque e logística',
  },
  {
    name: 'Ads & Marketing',
    href: '/dashboard/ads',
    icon: Megaphone,
    flag: 'ads_v1',
    badge: 'Em breve',
    description: 'Campanhas e ROI',
  },
  {
    name: 'Market Intelligence',
    href: '/dashboard/market',
    icon: TrendingUp,
    flag: 'market_v1',
    description: 'Análise de mercado',
  },
  {
    name: 'Chat 360',
    href: '/dashboard/chat',
    icon: MessageSquare,
    flag: 'chat360_v1',
    badge: 'Em breve',
    description: 'Atendimento omnichannel',
  },
  {
    name: 'Missões IA',
    href: '/dashboard/missions',
    icon: CheckSquare,
    flag: 'missions_v1',
    description: 'Tarefas inteligentes',
  },
];

const bottomNavigation: NavigationItem[] = [
  {
    name: 'Configurações',
    href: '/dashboard/configuracoes',
    icon: Settings,
    description: 'Integrações e preferências',
  },
];

export function UltraPremiumSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Check if feature is enabled (mock for now)
  const isFeatureEnabled = (flag?: string) => {
    if (!flag) return true;
    // TODO: Implement real feature flag check
    const enabledFlags = ['bi_v2', 'planning_v1', 'market_v1', 'missions_v1'];
    return enabledFlags.includes(flag);
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const NavItem = ({ item }: { item: NavigationItem }) => {
    const active = isActive(item.href);
    const enabled = isFeatureEnabled(item.flag);
    
    const content = (
      <Link
        href={enabled ? item.href : '#'}
        className={cn(
          'group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
          'hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          active
            ? 'bg-primary text-primary-foreground shadow-sm'
            : enabled
            ? 'text-foreground hover:text-foreground'
            : 'text-muted-foreground cursor-not-allowed opacity-60',
          collapsed ? 'justify-center px-2' : 'justify-start'
        )}
        aria-disabled={!enabled}
      >
        <item.icon
          className={cn(
            'h-5 w-5 flex-shrink-0 transition-colors',
            collapsed ? '' : 'mr-3'
          )}
        />
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{item.name}</span>
            {item.badge && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {item.badge}
              </Badge>
            )}
          </>
        )}
      </Link>
    );

    if (collapsed && item.description) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{content}</TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-xs text-muted-foreground">
                  {item.description}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return content;
  };

  return (
    <div
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-background transition-all duration-300',
        collapsed ? 'w-16' : 'w-72'
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold">ECOMMIND</span>
              <span className="text-xs text-muted-foreground">v1.0.0</span>
            </div>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 p-0"
          aria-label={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => (
          <NavItem key={item.name} item={item} />
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-border p-4">
        <div className="space-y-1">
          {bottomNavigation.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </div>
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t border-border p-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              © 2025 ECOMMIND
            </p>
            <p className="text-xs text-muted-foreground">
              Todos os direitos reservados
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
