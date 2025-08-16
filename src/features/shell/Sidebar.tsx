/**
 * Sidebar - Navegação lateral do aplicativo
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  Calendar,
  BarChart3,
  MessageSquare,
  TrendingUp,
  Megaphone,
  Package,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useRBAC } from '@/hooks/useRBAC';
import { cn } from '@/lib/utils';

interface SidebarProps {
  open: boolean;
  collapsed: boolean;
  onOpenChange: (open: boolean) => void;
  onCollapsedChange: (collapsed: boolean) => void;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/app',
    icon: LayoutDashboard,
    roles: ['admin', 'manager', 'operator', 'viewer'],
  },
  {
    name: 'Planning',
    href: '/app/planning',
    icon: Calendar,
    roles: ['admin', 'manager', 'operator'],
    description: 'Metas, Orçamento & Calendário',
  },
  {
    name: 'BI Inteligente',
    href: '/app/bi',
    icon: BarChart3,
    roles: ['admin', 'manager', 'operator', 'viewer'],
    description: 'Analytics & Insights',
  },
  {
    name: 'Chat 360',
    href: '/app/chat',
    icon: MessageSquare,
    roles: ['admin', 'manager', 'operator'],
    description: 'Atendimento Unificado',
  },
  {
    name: 'Market Intelligence',
    href: '/app/market',
    icon: TrendingUp,
    roles: ['admin', 'manager', 'operator', 'viewer'],
    description: 'Análise de Mercado',
  },
  {
    name: 'Ads & Marketing',
    href: '/app/ads',
    icon: Megaphone,
    roles: ['admin', 'manager', 'operator'],
    description: 'Campanhas & Performance',
  },
  {
    name: 'Operações',
    href: '/app/operations',
    icon: Package,
    roles: ['admin', 'manager', 'operator'],
    description: 'Estoque & Logística',
  },
  {
    name: 'Relatórios',
    href: '/app/reports',
    icon: FileText,
    roles: ['admin', 'manager', 'operator', 'viewer'],
    description: 'Relatórios Customizados',
  },
  {
    name: 'Configurações',
    href: '/app/settings',
    icon: Settings,
    roles: ['admin', 'manager'],
    description: 'Empresa, Integrações & Usuários',
  },
];

export function Sidebar({ open, collapsed, onOpenChange, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname();
  const { canAccess } = useRBAC();

  // Filter navigation items based on user permissions
  const filteredNavigation = navigation.filter(item => 
    canAccess(item.href, item.roles)
  );

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: '-100%' },
  };

  const contentVariants = {
    expanded: { width: 256 },
    collapsed: { width: 64 },
  };

  return (
    <TooltipProvider>
      <div className="relative">
        {/* Mobile sidebar */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={sidebarVariants}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r shadow-lg lg:hidden"
            >
              <SidebarContent
                collapsed={false}
                filteredNavigation={filteredNavigation}
                pathname={pathname}
                onItemClick={() => onOpenChange(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop sidebar */}
        <motion.div
          variants={contentVariants}
          animate={collapsed ? 'collapsed' : 'expanded'}
          transition={{ type: 'tween', duration: 0.3 }}
          className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:flex-col bg-card border-r"
        >
          <SidebarContent
            collapsed={collapsed}
            filteredNavigation={filteredNavigation}
            pathname={pathname}
            showToggle
            onToggle={() => onCollapsedChange(!collapsed)}
          />
        </motion.div>
      </div>
    </TooltipProvider>
  );
}

interface SidebarContentProps {
  collapsed: boolean;
  filteredNavigation: typeof navigation;
  pathname: string;
  showToggle?: boolean;
  onToggle?: () => void;
  onItemClick?: () => void;
}

function SidebarContent({
  collapsed,
  filteredNavigation,
  pathname,
  showToggle,
  onToggle,
  onItemClick,
}: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b px-4">
        <Link href="/app" className="flex items-center space-x-2">
          <Image
            src="/logo.svg"
            alt="ECOMMIND"
            width={collapsed ? 32 : 120}
            height={32}
            className="dark:invert transition-all duration-300"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/app' && pathname.startsWith(item.href));

          const NavItem = (
            <Link
              key={item.name}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                'hover:bg-accent hover:text-accent-foreground',
                'focus:bg-accent focus:text-accent-foreground focus:outline-none',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 shrink-0 transition-colors',
                  collapsed ? 'mx-auto' : 'mr-3'
                )}
                aria-hidden="true"
              />
              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col overflow-hidden"
                  >
                    <span className="truncate">{item.name}</span>
                    {item.description && (
                      <span className="text-xs opacity-75 truncate">
                        {item.description}
                      </span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>
                  {NavItem}
                </TooltipTrigger>
                <TooltipContent side="right" className="flex flex-col">
                  <span className="font-medium">{item.name}</span>
                  {item.description && (
                    <span className="text-xs opacity-75">{item.description}</span>
                  )}
                </TooltipContent>
              </Tooltip>
            );
          }

          return NavItem;
        })}
      </nav>

      {/* Toggle button */}
      {showToggle && (
        <div className="border-t p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className={cn(
              'w-full justify-center',
              collapsed ? 'px-2' : 'justify-start px-3'
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Recolher
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
