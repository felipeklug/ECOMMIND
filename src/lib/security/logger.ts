// Secure logging utilities
// Prevents sensitive data from being logged while maintaining debugging capabilities

interface LogContext {
  userId?: string
  companyId?: string
  action?: string
  ip?: string
  userAgent?: string
}

interface SensitivePatterns {
  tokens: RegExp[]
  passwords: RegExp[]
  emails: RegExp[]
  phones: RegExp[]
  documents: RegExp[]
}

// Patterns to detect and redact sensitive information
const SENSITIVE_PATTERNS: SensitivePatterns = {
  tokens: [
    /access_token["\s]*[:=]["\s]*([^"'\s,}]+)/gi,
    /refresh_token["\s]*[:=]["\s]*([^"'\s,}]+)/gi,
    /bearer\s+([a-zA-Z0-9\-._~+/]+=*)/gi,
    /jwt\s+([a-zA-Z0-9\-._~+/]+=*)/gi
  ],
  passwords: [
    /password["\s]*[:=]["\s]*([^"'\s,}]+)/gi,
    /passwd["\s]*[:=]["\s]*([^"'\s,}]+)/gi,
    /secret["\s]*[:=]["\s]*([^"'\s,}]+)/gi
  ],
  emails: [
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
  ],
  phones: [
    /\b\d{2}\s?\d{4,5}-?\d{4}\b/g,
    /\(\d{2}\)\s?\d{4,5}-?\d{4}/g
  ],
  documents: [
    /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, // CPF
    /\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g // CNPJ
  ]
}

/**
 * Redact sensitive information from log messages
 * @param message - Log message to sanitize
 * @returns Sanitized message with sensitive data redacted
 */
function redactSensitiveData(message: string): string {
  let sanitized = message

  // Redact tokens
  SENSITIVE_PATTERNS.tokens.forEach(pattern => {
    sanitized = sanitized.replace(pattern, (match, token) => {
      const redacted = token.length > 8 
        ? `${token.substring(0, 4)}...${token.substring(token.length - 4)}`
        : '[REDACTED]'
      return match.replace(token, redacted)
    })
  })

  // Redact passwords
  SENSITIVE_PATTERNS.passwords.forEach(pattern => {
    sanitized = sanitized.replace(pattern, (match) => 
      match.replace(/[:=]["\s]*([^"'\s,}]+)/, ': [REDACTED]')
    )
  })

  // Redact emails (partial)
  SENSITIVE_PATTERNS.emails.forEach(pattern => {
    sanitized = sanitized.replace(pattern, (email) => {
      const [local, domain] = email.split('@')
      const redactedLocal = local.length > 2 
        ? `${local[0]}***${local[local.length - 1]}`
        : '***'
      return `${redactedLocal}@${domain}`
    })
  })

  // Redact phones
  SENSITIVE_PATTERNS.phones.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[PHONE_REDACTED]')
  })

  // Redact documents
  SENSITIVE_PATTERNS.documents.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[DOCUMENT_REDACTED]')
  })

  return sanitized
}

/**
 * Secure logger that redacts sensitive information
 */
export class SecureLogger {
  private context: LogContext

  constructor(context: LogContext = {}) {
    this.context = context
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString()
    const contextStr = Object.entries(this.context)
      .map(([key, value]) => `${key}=${value}`)
      .join(' ')
    
    let logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`
    
    if (contextStr) {
      logMessage += ` | ${contextStr}`
    }
    
    if (data) {
      const dataStr = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
      logMessage += ` | Data: ${dataStr}`
    }

    return redactSensitiveData(logMessage)
  }

  info(message: string, data?: any): void {
    console.log(this.formatMessage('info', message, data))
  }

  warn(message: string, data?: any): void {
    console.warn(this.formatMessage('warn', message, data))
  }

  error(message: string, error?: Error | any): void {
    const errorData = error instanceof Error 
      ? { message: error.message, stack: error.stack }
      : error
    
    console.error(this.formatMessage('error', message, errorData))
  }

  debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('debug', message, data))
    }
  }

  security(message: string, data?: any): void {
    // Security events should always be logged
    const securityLog = this.formatMessage('SECURITY', message, data)
    console.warn(`🔒 ${securityLog}`)
    
    // In production, you might want to send this to a security monitoring service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to security monitoring service
    }
  }

  audit(action: string, data?: any): void {
    const auditLog = this.formatMessage('AUDIT', action, data)
    console.log(`📋 ${auditLog}`)
    
    // In production, you might want to send this to an audit log service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to audit log service
    }
  }
}

/**
 * Create a logger with context
 * @param context - Logging context
 * @returns Configured logger instance
 */
export function createLogger(context: LogContext = {}): SecureLogger {
  return new SecureLogger(context)
}

/**
 * Default logger instance
 */
export const logger = new SecureLogger()

/**
 * Log authentication events
 * @param event - Auth event type
 * @param userId - User ID
 * @param details - Additional details
 */
export function logAuthEvent(
  event: 'login' | 'logout' | 'failed_login' | 'token_refresh' | 'password_reset',
  userId?: string,
  details?: any
): void {
  const authLogger = createLogger({ userId, action: 'auth' })
  authLogger.security(`Authentication event: ${event}`, details)
}

/**
 * Log API access events
 * @param method - HTTP method
 * @param path - API path
 * @param userId - User ID
 * @param status - Response status
 * @param duration - Request duration in ms
 */
export function logApiAccess(
  method: string,
  path: string,
  userId?: string,
  status?: number,
  duration?: number
): void {
  const apiLogger = createLogger({ userId, action: 'api_access' })
  apiLogger.audit(`${method} ${path}`, { status, duration })
}

/**
 * Log data access events
 * @param action - Data action (read, write, delete)
 * @param resource - Resource type
 * @param resourceId - Resource ID
 * @param userId - User ID
 */
export function logDataAccess(
  action: 'read' | 'write' | 'delete',
  resource: string,
  resourceId?: string,
  userId?: string
): void {
  const dataLogger = createLogger({ userId, action: 'data_access' })
  dataLogger.audit(`${action} ${resource}`, { resourceId })
}

/**
 * Log integration events
 * @param integration - Integration name (e.g., 'bling', 'whatsapp')
 * @param event - Event type
 * @param companyId - Company ID
 * @param details - Additional details
 */
export function logIntegrationEvent(
  integration: string,
  event: string,
  companyId?: string,
  details?: any
): void {
  const integrationLogger = createLogger({ companyId, action: 'integration' })
  integrationLogger.info(`${integration}: ${event}`, details)
}
