/**
 * Authentication Helper for ECOMMIND API
 * Handles session validation and context extraction
 */

import { resolveFlags, type Flags } from '@/lib/flags';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export interface SessionContext {
  userId: string;
  companyId: string;
  role: string;
  email: string;
  flags: Flags;
  isAuthenticated: boolean;
}

export interface UserProfile {
  id: string;
  company_id: string;
  email: string;
  name: string | null;
  role: string;
  settings: {
    theme?: 'light' | 'dark';
    flags?: Partial<Flags>;
    [key: string]: any;
  };
}

/**
 * Get session context from Supabase Auth
 * Returns user info, company, role and resolved feature flags
 * NEVER returns secrets or sensitive data
 */
export async function getSessionContext(): Promise<SessionContext> {
  try {
    const supabase = createClient();
    
    // Get current user from Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        userId: '',
        companyId: '',
        role: 'guest',
        email: '',
        flags: resolveFlags(),
        isAuthenticated: false,
      };
    }

    // Get user profile with company info
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, company_id, email, name, role, settings')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      // User exists but no profile - should not happen in normal flow
      return {
        userId: user.id,
        companyId: '',
        role: 'guest',
        email: user.email || '',
        flags: resolveFlags(),
        isAuthenticated: true,
      };
    }

    // Extract user flags from profile settings
    const userFlags = profile.settings?.flags || {};

    return {
      userId: profile.id,
      companyId: profile.company_id,
      role: profile.role,
      email: profile.email,
      flags: resolveFlags(userFlags),
      isAuthenticated: true,
    };

  } catch (error) {
    // Log error but don't expose details to client
    console.error('Session context error:', error);
    
    return {
      userId: '',
      companyId: '',
      role: 'guest',
      email: '',
      flags: resolveFlags(),
      isAuthenticated: false,
    };
  }
}

/**
 * Validate if user has required role
 */
export function hasRole(context: SessionContext, requiredRole: string | string[]): boolean {
  if (!context.isAuthenticated) return false;
  
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  return roles.includes(context.role);
}

/**
 * Validate if user belongs to specific company
 */
export function belongsToCompany(context: SessionContext, companyId: string): boolean {
  return context.isAuthenticated && context.companyId === companyId;
}

/**
 * Get company ID for RLS policies
 * Used in database queries to enforce tenant isolation
 */
export function getCompanyIdForRLS(context: SessionContext): string | null {
  return context.isAuthenticated ? context.companyId : null;
}

/**
 * Create response for unauthorized access
 */
export function createUnauthorizedResponse(message = 'Unauthorized'): Response {
  return new Response(
    JSON.stringify({ error: message }),
    { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

/**
 * Create response for forbidden access
 */
export function createForbiddenResponse(message = 'Forbidden'): Response {
  return new Response(
    JSON.stringify({ error: message }),
    { 
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

/**
 * Middleware helper to validate API access
 */
export async function validateApiAccess(
  requiredRole?: string | string[]
): Promise<{ context: SessionContext; error?: Response }> {
  const context = await getSessionContext();
  
  if (!context.isAuthenticated) {
    return {
      context,
      error: createUnauthorizedResponse('Authentication required')
    };
  }
  
  if (requiredRole && !hasRole(context, requiredRole)) {
    return {
      context,
      error: createForbiddenResponse('Insufficient permissions')
    };
  }
  
  return { context };
}

/**
 * Extract correlation ID for logging
 */
export function getCorrelationId(): string {
  // Generate or extract from headers
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Safe logger that excludes PII and secrets
 */
export function logSecure(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
  const correlationId = getCorrelationId();
  
  // Filter out sensitive data
  const safeData = data ? sanitizeLogData(data) : undefined;
  
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    correlationId,
    ...(safeData && { data: safeData })
  };
  
  console[level](JSON.stringify(logEntry));
}

/**
 * Remove sensitive data from log entries
 */
function sanitizeLogData(data: any): any {
  if (typeof data !== 'object' || data === null) return data;
  
  const sensitive = ['password', 'token', 'secret', 'key', 'auth', 'credential'];
  const sanitized = { ...data };
  
  for (const key in sanitized) {
    if (sensitive.some(s => key.toLowerCase().includes(s))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeLogData(sanitized[key]);
    }
  }
  
  return sanitized;
}
