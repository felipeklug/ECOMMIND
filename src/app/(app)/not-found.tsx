/**
 * 404 Page - Página não encontrada (App)
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: '404 - Página não encontrada',
  description: 'A página que você está procurando não foi encontrada.',
};

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <div className="text-center space-y-8 max-w-md">
        {/* 404 Illustration */}
        <div className="relative">
          <div className="text-8xl font-bold text-primary/20 select-none">
            404
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Search className="h-16 w-16 text-muted-foreground" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-foreground">
            Página não encontrada
          </h1>
          <p className="text-muted-foreground">
            A página que você está procurando não existe ou foi movida.
            Verifique o endereço ou navegue para uma das páginas disponíveis.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/app">
              <Home className="mr-2 h-4 w-4" />
              Ir para Dashboard
            </Link>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>

        {/* Quick Links */}
        <div className="pt-8 border-t">
          <p className="text-sm text-muted-foreground mb-4">
            Páginas populares:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/app/bi">BI Inteligente</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/app/chat">Chat 360</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/app/reports">Relatórios</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/app/settings">Configurações</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
