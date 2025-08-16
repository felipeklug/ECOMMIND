/**
 * Secure Logger for ECOMMIND
 * Provides structured logging with PII protection and correlation IDs
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  correlationId: string;
  userId?: string;
  companyId?: string;
  data?: any;
  stack?: string;
}

/**
 * Generate correlation ID for request tracking
 */
export function generateCorrelationId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Sanitize data to remove PII and sensitive information
 */
function sanitizeData(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }

  const sensitiveKeys = [
    'password',
    'token',
    'secret',
    'key',
    'auth',
    'credential',
    'authorization',
    'cookie',
    'session',
    'jwt',
    'bearer',
    'api_key',
    'access_token',
    'refresh_token',
    'client_secret',
    'private_key',
    'email', // PII
    'phone', // PII
    'cpf',   // PII
    'cnpj',  // PII
    'address', // PII
  ];

  const sanitized: any = {};

  for (const [key, value] of Object.entries(data)) {
    const keyLower = key.toLowerCase();
    
    if (sensitiveKeys.some(sensitive => keyLower.includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Core logger class
 */
class Logger {
  private correlationId: string;

  constructor(correlationId?: string) {
    this.correlationId = correlationId || generateCorrelationId();
  }

  /**
   * Create child logger with same correlation ID
   */
  child(additionalContext?: { userId?: string; companyId?: string }): Logger {
    const child = new Logger(this.correlationId);
    if (additionalContext) {
      (child as any).context = additionalContext;
    }
    return child;
  }

  /**
   * Log at debug level
   */
  debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }

  /**
   * Log at info level
   */
  info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  /**
   * Log at warn level
   */
  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  /**
   * Log at error level
   */
  error(message: string, error?: Error | any): void {
    const errorData = error instanceof Error 
      ? { 
          name: error.name, 
          message: error.message, 
          stack: error.stack 
        }
      : error;
    
    this.log('error', message, errorData);
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, data?: any): void {
    // Skip debug logs in production
    if (level === 'debug' && process.env.NODE_ENV === 'production') {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      correlationId: this.correlationId,
    };

    // Add context if available
    const context = (this as any).context;
    if (context?.userId) entry.userId = context.userId;
    if (context?.companyId) entry.companyId = context.companyId;

    // Sanitize and add data
    if (data !== undefined) {
      entry.data = sanitizeData(data);
    }

    // Output based on environment
    if (process.env.NODE_ENV === 'development') {
      // Pretty print for development
      console[level === 'debug' ? 'log' : level](
        `[${entry.timestamp}] ${level.toUpperCase()} [${entry.correlationId}] ${message}`,
        entry.data ? entry.data : ''
      );
    } else {
      // Structured JSON for production
      console[level === 'debug' ? 'log' : level](JSON.stringify(entry));
    }
  }
}

/**
 * Default logger instance
 */
export const logger = new Logger();

/**
 * Create logger with correlation ID
 */
export function createLogger(correlationId?: string): Logger {
  return new Logger(correlationId);
}

/**
 * Create logger with user context
 */
export function createUserLogger(userId: string, companyId: string, correlationId?: string): Logger {
  return new Logger(correlationId).child({ userId, companyId });
}

/**
 * Express/Next.js middleware to add correlation ID to requests
 */
export function withCorrelationId<T extends { headers: Headers }>(
  request: T
): T & { correlationId: string } {
  const correlationId = request.headers.get('x-correlation-id') || generateCorrelationId();
  
  return {
    ...request,
    correlationId,
  };
}

/**
 * Performance timing helper
 */
export class Timer {
  private startTime: number;
  private logger: Logger;
  private operation: string;

  constructor(operation: string, logger: Logger = new Logger()) {
    this.startTime = Date.now();
    this.logger = logger;
    this.operation = operation;
    
    this.logger.debug(`Starting ${operation}`);
  }

  /**
   * End timer and log duration
   */
  end(additionalData?: any): number {
    const duration = Date.now() - this.startTime;
    
    this.logger.info(`Completed ${this.operation}`, {
      duration_ms: duration,
      ...additionalData,
    });
    
    return duration;
  }

  /**
   * Log checkpoint without ending timer
   */
  checkpoint(checkpoint: string, additionalData?: any): void {
    const elapsed = Date.now() - this.startTime;
    
    this.logger.debug(`${this.operation} - ${checkpoint}`, {
      elapsed_ms: elapsed,
      ...additionalData,
    });
  }
}

/**
 * Create performance timer
 */
export function createTimer(operation: string, logger?: Logger): Timer {
  return new Timer(operation, logger);
}

/**
 * Log API request/response
 */
export function logApiCall(
  method: string,
  path: string,
  statusCode: number,
  duration: number,
  userId?: string,
  companyId?: string
): void {
  const logger = userId && companyId 
    ? createUserLogger(userId, companyId)
    : new Logger();

  const level: LogLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
  
  logger[level]('API call completed', {
    method,
    path,
    statusCode,
    duration_ms: duration,
  });
}

/**
 * Log database query
 */
export function logDbQuery(
  query: string,
  duration: number,
  rowCount?: number,
  error?: Error
): void {
  if (error) {
    logger.error('Database query failed', {
      query: query.substring(0, 100) + '...', // Truncate long queries
      duration_ms: duration,
      error: error.message,
    });
  } else {
    logger.debug('Database query completed', {
      query: query.substring(0, 100) + '...',
      duration_ms: duration,
      rowCount,
    });
  }
}
