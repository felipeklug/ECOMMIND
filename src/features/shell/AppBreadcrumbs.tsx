/**
 * App Breadcrumbs - Navegação breadcrumb
 */

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const routeNames: Record<string, string> = {
  '/app': 'Dashboard',
  '/app/planning': 'Planning',
  '/app/bi': 'BI Inteligente',
  '/app/chat': 'Chat 360',
  '/app/market': 'Market Intelligence',
  '/app/ads': 'Ads & Marketing',
  '/app/operations': 'Operações',
  '/app/reports': 'Relatórios',
  '/app/settings': 'Configurações',
  '/app/profile': 'Perfil',
};

export function AppBreadcrumbs() {
  const pathname = usePathname();
  
  // Generate breadcrumb items
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    const name = routeNames[path] || segment.charAt(0).toUpperCase() + segment.slice(1);
    
    return {
      name,
      path,
      isLast: index === pathSegments.length - 1,
    };
  });

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
      <Link
        href="/app"
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.path} className="flex items-center space-x-1">
          <ChevronRight className="h-4 w-4" />
          {breadcrumb.isLast ? (
            <span className="font-medium text-foreground">
              {breadcrumb.name}
            </span>
          ) : (
            <Link
              href={breadcrumb.path}
              className="hover:text-foreground transition-colors"
            >
              {breadcrumb.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
