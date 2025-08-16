/**
 * Error Page - Página de erro (App)
 */

'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { logSecure } from '@/lib/logger';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error securely (without sensitive data)
    logSecure('App error boundary triggered', {
      errorMessage: error.message,
      errorDigest: error.digest,
      errorStack: error.stack?.substring(0, 500), // Limit stack trace
      userAgent: navigator.userAgent,
      url: window.location.href,
    });
  }, [error]);

  const errorId = error.digest || Date.now().toString();

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <div className="text-center space-y-8 max-w-lg">
        {/* Error Illustration */}
        <div className="relative">
          <div className="mx-auto w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-foreground">
            Algo deu errado
          </h1>
          <p className="text-muted-foreground">
            Ocorreu um erro inesperado. Nossa equipe foi notificada e está
            trabalhando para resolver o problema.
          </p>
        </div>

        {/* Error Details */}
        <div>
          <Alert>
            <Bug className="h-4 w-4" />
            <AlertDescription>
              <strong>ID do Erro:</strong> {errorId}
              <br />
              <span className="text-xs text-muted-foreground">
                Use este ID ao entrar em contato com o suporte
              </span>
            </AlertDescription>
          </Alert>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar Novamente
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/app'}>
            <Home className="mr-2 h-4 w-4" />
            Ir para Dashboard
          </Button>
        </div>

        {/* Support Info */}
        <div className="pt-8 border-t text-sm text-muted-foreground">
          <p>
            Se o problema persistir, entre em contato com nosso suporte:
          </p>
          <div className="mt-2 space-x-4">
            <a 
              href="mailto:suporte@ecommind.com.br" 
              className="text-primary hover:underline"
            >
              suporte@ecommind.com.br
            </a>
            <span>•</span>
            <a 
              href="https://wa.me/5511999999999" 
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
