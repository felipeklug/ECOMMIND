/**
 * ECOMMIND Security Middleware
 * Handles authentication, feature flags, and security headers
 * RuleAgent Gate: Validação dos 3 prompts fundamentais
 */

import { assertAllRules } from '@/core/agents/RuleAgent';
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getModuleFromPath, isModuleEnabled } from '@/lib/flags';

// RuleAgent Gate - Validação automática
if (process.env.NODE_ENV !== 'test') {
  assertAllRules({ pr: 'PR#20.1', modules: ['auth', 'middleware'] }).catch(console.error);
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const path = url.pathname;

  // Create Supabase client for auth
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Set security headers on all responses
  setSecurityHeaders(supabaseResponse);

  // Public routes that bypass all checks
  if (isPublicRoute(path)) {
    return supabaseResponse;
  }

  // Emergency route is always accessible
  if (path.startsWith('/emergency')) {
    return supabaseResponse;
  }

  // Check authentication for protected routes
  if (isProtectedRoute(path) && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', path);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login
  if (path === '/login' && user) {
    const dashboardUrl = new URL('/app', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Feature flag gates for dashboard modules
  if (path.startsWith('/dashboard/')) {
    const moduleGateResult = checkModuleGate(path, request);
    if (moduleGateResult) {
      return moduleGateResult;
    }
  }

  // Rate limiting for API routes (basic implementation)
  if (path.startsWith('/api/') && !path.startsWith('/api/auth/')) {
    const rateLimitResult = checkRateLimit(request);
    if (rateLimitResult) {
      return rateLimitResult;
    }
  }

  return supabaseResponse;
}

/**
 * Set comprehensive security headers
 */
function setSecurityHeaders(response: NextResponse): void {
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Disable potentially dangerous browser features
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://vercel.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co https://vercel.live wss://*.supabase.co",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  // HSTS for HTTPS enforcement (only in production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
}

/**
 * Check if route is public (no authentication required)
 */
function isPublicRoute(path: string): boolean {
  const publicRoutes = [
    '/',
    '/recursos',
    '/modulos',
    '/precos',
    '/seguranca',
    '/sobre',
    '/contato',
    '/termos',
    '/privacidade',
    '/dpa',
    '/login',
    '/logout',
    '/convite',
    '/auth/callback',
    '/api/health',
    '/api/auth/',
    '/api/lead',
    '/emergency',
    '/_next/',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
  ];

  return publicRoutes.some(route => path.startsWith(route));
}

/**
 * Check if route requires authentication
 */
function isProtectedRoute(path: string): boolean {
  const protectedPrefixes = [
    '/app',
    '/dashboard',
    '/api/secure',
    '/onboarding',
    '/settings',
    '/profile',
    '/api-test',
  ];

  return protectedPrefixes.some(prefix => path.startsWith(prefix));
}

/**
 * Check module feature flags and redirect if disabled
 */
function checkModuleGate(path: string, req: NextRequest): NextResponse | null {
  const module = getModuleFromPath(path);

  if (!module) {
    return null; // No specific module, allow access
  }

  // Check if module is enabled via environment flags
  const isEnabled = isModuleEnabled(module);

  if (!isEnabled) {
    const soonUrl = new URL('/dashboard/soon', req.url);
    soonUrl.searchParams.set('m', module);
    return NextResponse.redirect(soonUrl);
  }

  return null;
}

/**
 * Basic rate limiting (stub implementation)
 * TODO: Implement with Redis or similar
 */
function checkRateLimit(req: NextRequest): NextResponse | null {
  // Get client IP
  const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';

  // Stub: In real implementation, check rate limits per IP
  // For now, just log the request
  if (process.env.NODE_ENV === 'development') {
    console.log(`API request from ${ip}: ${req.nextUrl.pathname}`);
  }

  // TODO: Implement actual rate limiting logic
  // Return 429 response if rate limit exceeded

  return null;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/secure/:path*',
    '/emergency',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
