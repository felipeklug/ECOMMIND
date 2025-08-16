/**
 * Bling Integration API Routes
 * Handles OAuth flow and integration status
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateApiAccess, logSecure } from '@/app/api/_helpers/auth';
import { BlingAdapter } from '@/core/adapters/erp/BlingAdapter';
import { createClient } from '@/lib/supabase/server';
import { createTimer } from '@/lib/logger';
import type { EncryptedTokenData, IntegrationStatus } from '@/core/types/bling';

const blingAdapter = new BlingAdapter();

/**
 * GET /api/integrations/bling
 * Get Bling integration status
 */
export async function GET(request: NextRequest) {
  const timer = createTimer('bling_integration_status');

  try {
    // Validate authentication
    const { context, error } = await validateApiAccess();
    if (error) return error;

    const { userId, companyId, isAuthenticated } = context;

    if (!isAuthenticated || !companyId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const supabase = createClient();

    // Get Bling tokens from company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('bling_tokens')
      .eq('id', companyId)
      .single();

    if (companyError) {
      logSecure('error', 'Failed to get company data', { companyId, error: companyError });
      return NextResponse.json(
        { error: 'Failed to get integration status' },
        { status: 500 }
      );
    }

    const status: IntegrationStatus = {
      connected: false,
    };

    if (company?.bling_tokens) {
      const tokenData = company.bling_tokens as EncryptedTokenData;

      status.connected = true;
      status.expires_at = tokenData.expires_at;
      status.scope = tokenData.scope;

      // Check if token is expired
      const expiresAt = new Date(tokenData.expires_at);
      const now = new Date();

      if (expiresAt <= now) {
        status.connected = false;
        status.error = 'Token expired';
      }
    }

    timer.end({ companyId, connected: status.connected });

    logSecure('info', 'Bling integration status retrieved', {
      companyId,
      connected: status.connected,
      expires_at: status.expires_at,
    });

    return NextResponse.json({ status });

  } catch (error) {
    timer.end({ error: true });

    logSecure('error', 'Bling integration status failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/integrations/bling
 * Generate OAuth authorization URL
 */
export async function POST(request: NextRequest) {
  const timer = createTimer('bling_oauth_init');

  try {
    // Validate authentication
    const { context, error } = await validateApiAccess();
    if (error) return error;

    const { userId, companyId, isAuthenticated } = context;

    if (!isAuthenticated || !companyId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Generate state parameter for CSRF protection
    const state = `${companyId}:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;

    // Generate OAuth URL
    const authUrl = blingAdapter.getAuthUrl(state);

    timer.end({ companyId });

    logSecure('info', 'Bling OAuth URL generated', {
      companyId,
      hasAuthUrl: !!authUrl,
    });

    return NextResponse.json({
      authUrl,
      state,
    });

  } catch (error) {
    timer.end({ error: true });

    logSecure('error', 'Bling OAuth URL generation failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Failed to generate authorization URL' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/integrations/bling
 * Disconnect Bling integration
 */
export async function DELETE(request: NextRequest) {
  const timer = createTimer('bling_integration_disconnect');

  try {
    // Validate authentication
    const { context, error } = await validateApiAccess();
    if (error) return error;

    const { userId, companyId, isAuthenticated } = context;

    if (!isAuthenticated || !companyId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const supabase = createClient();

    // Remove Bling tokens from company
    const { error: updateError } = await supabase
      .from('companies')
      .update({
        bling_tokens: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', companyId);

    if (updateError) {
      throw new Error(`Failed to disconnect integration: ${updateError.message}`);
    }

    timer.end({ companyId });

    logSecure('info', 'Bling integration disconnected', { companyId });

    return NextResponse.json({
      success: true,
      message: 'Bling integration disconnected successfully',
    });

  } catch (error) {
    timer.end({ error: true });

    logSecure('error', 'Bling integration disconnect failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Failed to disconnect integration' },
      { status: 500 }
    );
  }
}
