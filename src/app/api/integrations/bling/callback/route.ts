/**
 * Bling OAuth Callback Handler
 * Handles the OAuth callback and token exchange
 */

import { NextRequest, NextResponse } from 'next/server';
import { BlingAdapter } from '@/core/adapters/erp/BlingAdapter';
import { createClient } from '@/lib/supabase/server';
import { logSecure, createTimer } from '@/lib/logger';

const blingAdapter = new BlingAdapter();

/**
 * GET /api/integrations/bling/callback
 * Handle OAuth callback from Bling
 */
export async function GET(request: NextRequest) {
  const timer = createTimer('bling_oauth_callback');

  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Handle OAuth errors
    if (error) {
      logSecure('warn', 'Bling OAuth error', {
        error,
        errorDescription
      });

      const redirectUrl = new URL('/dashboard/configuracoes/bling', request.url);
      redirectUrl.searchParams.set('error', error);
      redirectUrl.searchParams.set('error_description', errorDescription || 'OAuth authorization failed');

      return NextResponse.redirect(redirectUrl);
    }

    // Validate required parameters
    if (!code || !state) {
      logSecure('warn', 'Bling OAuth callback missing parameters', {
        hasCode: !!code,
        hasState: !!state
      });

      const redirectUrl = new URL('/dashboard/configuracoes/bling', request.url);
      redirectUrl.searchParams.set('error', 'invalid_request');
      redirectUrl.searchParams.set('error_description', 'Missing authorization code or state');

      return NextResponse.redirect(redirectUrl);
    }

    // Parse state to extract company ID
    const stateParts = state.split(':');
    if (stateParts.length < 3) {
      logSecure('warn', 'Bling OAuth invalid state format', { state });

      const redirectUrl = new URL('/dashboard/configuracoes/bling', request.url);
      redirectUrl.searchParams.set('error', 'invalid_state');
      redirectUrl.searchParams.set('error_description', 'Invalid state parameter');

      return NextResponse.redirect(redirectUrl);
    }

    const companyId = stateParts[0];
    const timestamp = parseInt(stateParts[1]);

    // Validate state timestamp (should be within last 10 minutes)
    const now = Date.now();
    const maxAge = 10 * 60 * 1000; // 10 minutes

    if (now - timestamp > maxAge) {
      logSecure('warn', 'Bling OAuth state expired', {
        companyId,
        timestamp,
        age: now - timestamp
      });

      const redirectUrl = new URL('/dashboard/configuracoes/bling', request.url);
      redirectUrl.searchParams.set('error', 'state_expired');
      redirectUrl.searchParams.set('error_description', 'Authorization request expired');

      return NextResponse.redirect(redirectUrl);
    }

    logSecure('info', 'Bling OAuth callback received', {
      companyId,
      hasCode: !!code
    });

    // Exchange code for tokens
    const encryptedTokenData = await blingAdapter.exchangeCode(code);

    // Save tokens to company record
    const supabase = createClient();

    const { error: updateError } = await supabase
      .from('companies')
      .update({
        bling_tokens: encryptedTokenData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', companyId);

    if (updateError) {
      logSecure('error', 'Failed to save Bling tokens', {
        companyId,
        error: updateError
      });

      const redirectUrl = new URL('/dashboard/configuracoes/bling', request.url);
      redirectUrl.searchParams.set('error', 'save_failed');
      redirectUrl.searchParams.set('error_description', 'Failed to save integration tokens');

      return NextResponse.redirect(redirectUrl);
    }

    timer.end({ companyId, success: true });

    logSecure('info', 'Bling integration completed successfully', {
      companyId,
      expires_at: encryptedTokenData.expires_at,
      scope: encryptedTokenData.scope,
    });

    // Redirect to success page
    const redirectUrl = new URL('/dashboard/configuracoes/bling', request.url);
    redirectUrl.searchParams.set('success', '1');
    redirectUrl.searchParams.set('connected', 'true');

    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    timer.end({ error: true });

    logSecure('error', 'Bling OAuth callback failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Redirect to error page
    const redirectUrl = new URL('/dashboard/configuracoes/bling', request.url);
    redirectUrl.searchParams.set('error', 'callback_failed');
    redirectUrl.searchParams.set('error_description', 'OAuth callback processing failed');

    return NextResponse.redirect(redirectUrl);
  }
}

// Handle unsupported methods
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}