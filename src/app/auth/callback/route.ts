/**
 * Auth Callback - Callback de autenticação Supabase
 */

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { logSecure } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const redirect = searchParams.get('redirect') || searchParams.get('redirectTo') || '/app';

  if (code) {
    try {
      const supabase = await createClient();

      // Exchange code for session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        logSecure('Auth callback error', {
          error: error.message,
        });

        // Redirect to login with error
        const loginUrl = new URL('/login', origin);
        loginUrl.searchParams.set('error', 'auth_failed');
        return NextResponse.redirect(loginUrl);
      }

      if (data.user) {
        logSecure('User authenticated successfully', {
          userId: data.user.id,
          email: data.user.email,
          provider: data.user.app_metadata?.provider,
        });

        // Check if user has completed onboarding
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed, company_id')
          .eq('id', data.user.id)
          .single();

        // If no profile or onboarding not completed, redirect to onboarding
        if (!profile || !profile.onboarding_completed) {
          logSecure('User needs onboarding', {
            userId: data.user.id,
            hasProfile: !!profile,
            onboardingCompleted: profile?.onboarding_completed,
          });

          return NextResponse.redirect(new URL('/onboarding', origin));
        }

        // User is fully set up, redirect to intended destination
        logSecure('User redirected to app', {
          userId: data.user.id,
          redirectTo: redirect,
        });

        const forwardedHost = request.headers.get('x-forwarded-host');
        const isLocalEnv = process.env.NODE_ENV === 'development';

        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${redirect}`);
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${redirect}`);
        } else {
          return NextResponse.redirect(`${origin}${redirect}`);
        }
      }

    } catch (error) {
      logSecure('Auth callback unexpected error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Fallback: redirect to login
  logSecure('Auth callback fallback redirect', {
    hasCode: !!code,
    redirect,
  });

  const loginUrl = new URL('/login', origin);
  if (!code) {
    loginUrl.searchParams.set('error', 'missing_code');
  }

  return NextResponse.redirect(loginUrl);
}
