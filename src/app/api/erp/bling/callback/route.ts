/**
 * Bling ERP OAuth Callback API
 * GET /api/erp/bling/callback
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { BlingAdapter } from '@/core/adapters/erp/BlingAdapter';
import { encryptToken } from '@/lib/crypto';
import { logSecure } from '@/lib/logger';
import { z } from 'zod';

const CallbackQuerySchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
  state: z.string().min(1, 'State parameter is required'),
  error: z.string().optional(),
  error_description: z.string().optional(),
});

interface StateData {
  companyId: string;
  userId: string;
  timestamp: number;
  customState?: string;
  redirectSuccess?: string;
  redirectError?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Parse and validate query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    
    const { data: params, error: validationError } = CallbackQuerySchema.safeParse(queryParams);
    if (validationError) {
      return NextResponse.json({
        error: 'Invalid callback parameters',
        details: validationError.errors,
      }, { status: 400 });
    }

    // Handle OAuth error response
    if (params.error) {
      logSecure('Bling OAuth callback error', {
        error: params.error,
        description: params.error_description,
      });

      return NextResponse.json({
        error: 'OAuth authorization failed',
        message: params.error_description || params.error,
      }, { status: 400 });
    }

    // Decode and validate state parameter
    let stateData: StateData;
    try {
      const decodedState = Buffer.from(params.state, 'base64').toString('utf-8');
      stateData = JSON.parse(decodedState);
    } catch (error) {
      logSecure('Bling OAuth callback - invalid state', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return NextResponse.json({
        error: 'Invalid state parameter',
        message: 'State parameter is corrupted or expired',
      }, { status: 400 });
    }

    // Validate state timestamp (prevent replay attacks)
    const stateAge = Date.now() - stateData.timestamp;
    const maxAge = 10 * 60 * 1000; // 10 minutes
    
    if (stateAge > maxAge) {
      logSecure('Bling OAuth callback - expired state', {
        stateAge,
        maxAge,
        companyId: stateData.companyId,
      });

      return NextResponse.json({
        error: 'Expired authorization request',
        message: 'Authorization request has expired. Please try again.',
      }, { status: 400 });
    }

    // Exchange authorization code for tokens
    const adapter = new BlingAdapter();
    const tokenResponse = await adapter.exchangeCodeForTokens(params.code);

    // Encrypt tokens for storage
    const encryptedAccessToken = encryptToken(tokenResponse.access_token);
    const encryptedRefreshToken = encryptToken(tokenResponse.refresh_token);

    // Store tokens in database
    const supabase = createSupabaseServerClient();
    
    const { error: upsertError } = await supabase
      .from('integrations_bling')
      .upsert({
        company_id: stateData.companyId,
        token_ciphertext: encryptedAccessToken,
        refresh_ciphertext: encryptedRefreshToken,
        scopes: tokenResponse.scope?.split(' ') || ['read', 'write'],
        sync_enabled: true,
        webhook_enabled: false,
        error_count: 0,
        last_error: null,
        last_error_at: null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'company_id',
      });

    if (upsertError) {
      logSecure('Bling OAuth callback - database error', {
        companyId: stateData.companyId,
        error: upsertError.message,
      });

      return NextResponse.json({
        error: 'Database error',
        message: 'Failed to store Bling integration tokens',
      }, { status: 500 });
    }

    // Log successful integration
    logSecure('Bling OAuth integration completed', {
      companyId: stateData.companyId,
      userId: stateData.userId,
      scopes: tokenResponse.scope?.split(' ') || [],
    });

    // Trigger initial sync (optional)
    try {
      // Could trigger background sync here
      // await triggerInitialSync(stateData.companyId);
    } catch (syncError) {
      // Log but don't fail the callback
      logSecure('Bling initial sync trigger failed', {
        companyId: stateData.companyId,
        error: syncError instanceof Error ? syncError.message : 'Unknown error',
      });
    }

    // Redirect to success URL or return success response
    if (stateData.redirectSuccess) {
      const redirectUrl = new URL(stateData.redirectSuccess);
      redirectUrl.searchParams.set('status', 'success');
      redirectUrl.searchParams.set('integration', 'bling');
      
      return NextResponse.redirect(redirectUrl.toString());
    }

    return NextResponse.json({
      success: true,
      message: 'Bling integration configured successfully',
      integration: {
        provider: 'bling',
        status: 'connected',
        scopes: tokenResponse.scope?.split(' ') || [],
        connectedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    logSecure('Bling callback API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Try to redirect to error URL if available
    const url = new URL(request.url);
    const state = url.searchParams.get('state');
    
    if (state) {
      try {
        const decodedState = Buffer.from(state, 'base64').toString('utf-8');
        const stateData: StateData = JSON.parse(decodedState);
        
        if (stateData.redirectError) {
          const redirectUrl = new URL(stateData.redirectError);
          redirectUrl.searchParams.set('status', 'error');
          redirectUrl.searchParams.set('integration', 'bling');
          redirectUrl.searchParams.set('message', error instanceof Error ? error.message : 'Unknown error');
          
          return NextResponse.redirect(redirectUrl.toString());
        }
      } catch (stateError) {
        // Ignore state parsing errors in error handler
      }
    }

    return NextResponse.json({
      error: 'Internal server error',
      message: 'Failed to complete Bling OAuth callback',
    }, { status: 500 });
  }
}
