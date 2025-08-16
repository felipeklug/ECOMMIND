/**
 * Error Page - Página de erro (App)
 */

'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
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
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="mx-auto w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center"
          >
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </motion.div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-4"
        >
          <h1 className="text-2xl font-bold text-foreground">
            Algo deu errado
          </h1>
          <p className="text-muted-foreground">
            Ocorreu um erro inesperado. Nossa equipe foi notificada e está 
            trabalhando para resolver o problema.
          </p>
        </motion.div>

        {/* Error Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
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
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Button onClick={reset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar Novamente
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/app'}>
            <Home className="mr-2 h-4 w-4" />
            Ir para Dashboard
          </Button>
        </motion.div>

        {/* Support Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="pt-8 border-t text-sm text-muted-foreground"
        >
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
        </motion.div>
      </div>
    </div>
  );
}
