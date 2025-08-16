/**
 * State Fallbacks - Componentes para estados de loading, error, empty
 */

import { motion } from 'framer-motion';
import { Loader2, AlertTriangle, Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

interface ErrorProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface EmptyProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}

const Loading = ({ message = 'Carregando...', size = 'md' }: LoadingProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center space-y-4 p-8"
    >
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
      <p className="text-sm text-muted-foreground">{message}</p>
    </motion.div>
  );
};

const Error = ({ 
  title = 'Algo deu errado',
  message = 'Ocorreu um erro inesperado. Tente novamente.',
  actionLabel = 'Tentar novamente',
  onAction 
}: ErrorProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center space-y-4 p-8 text-center"
    >
      <div className="rounded-full bg-destructive/10 p-3">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-md">{message}</p>
      </div>
      {onAction && (
        <Button onClick={onAction} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
};

const Empty = ({
  title = 'Nenhum item encontrado',
  message = 'Não há dados para exibir no momento.',
  actionLabel,
  onAction,
  icon: Icon = Search,
}: EmptyProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center space-y-4 p-8 text-center"
    >
      <div className="rounded-full bg-muted p-3">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-md">{message}</p>
      </div>
      {onAction && actionLabel && (
        <Button onClick={onAction} variant="outline">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
};

export const StateFallbacks = {
  Loading,
  Error,
  Empty,
};
