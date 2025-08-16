/**
 * Bling ERP Health Check API
 * GET /api/erp/bling/health
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateApiAccess } from '@/app/api/_helpers/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { BlingAdapter } from '@/core/adapters/erp/BlingAdapter';
import { decryptToken } from '@/lib/crypto';
import { logSecure } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    // Validate authentication and get context
    const { context, error } = await validateApiAccess();
    if (error) return error;

    const supabase = createSupabaseServerClient();

    // Get Bling integration for this company
    const { data: integration, error: integrationError } = await supabase
      .from('integrations_bling')
      .select('*')
      .eq('company_id', context.companyId)
      .single();

    if (integrationError || !integration) {
      return NextResponse.json({
        status: 'not_configured',
        message: 'Bling integration not configured',
        connected: false,
        lastSync: null,
        errors: [],
      }, { status: 200 });
    }

    try {
      // Decrypt tokens and test connection
      const accessToken = decryptToken(integration.token_ciphertext);
      const refreshToken = decryptToken(integration.refresh_ciphertext);

      const adapter = new BlingAdapter();
      adapter.setTokens(
        accessToken,
        refreshToken,
        new Date(Date.now() + 3600000) // 1 hour from now
      );

      // Perform health check
      const healthResult = await adapter.healthCheck();

      // Get sync status
      const syncStatus = {
        products: integration.last_sync_products,
        orders: integration.last_sync_orders,
        finance: integration.last_sync_finance,
      };

      // Check for recent errors
      const errors = [];
      if (integration.error_count > 0 && integration.last_error) {
        errors.push({
          message: integration.last_error,
          count: integration.error_count,
          lastOccurred: integration.last_error_at,
        });
      }

      logSecure('Bling health check completed', {
        companyId: context.companyId,
        status: healthResult.status,
        tokenValid: healthResult.tokenValid,
        errorCount: integration.error_count,
      });

      return NextResponse.json({
        status: healthResult.status,
        message: healthResult.message,
        connected: healthResult.tokenValid,
        lastSync: syncStatus,
        errors,
        config: {
          syncEnabled: integration.sync_enabled,
          webhookEnabled: integration.webhook_enabled,
          scopes: integration.scopes,
        },
        lastCheck: healthResult.lastCheck,
      });

    } catch (tokenError) {
      logSecure('Bling health check failed - token error', {
        companyId: context.companyId,
        error: tokenError instanceof Error ? tokenError.message : 'Unknown error',
      });

      return NextResponse.json({
        status: 'unhealthy',
        message: 'Token validation failed',
        connected: false,
        lastSync: {
          products: integration.last_sync_products,
          orders: integration.last_sync_orders,
          finance: integration.last_sync_finance,
        },
        errors: [{
          message: tokenError instanceof Error ? tokenError.message : 'Token validation failed',
          count: 1,
          lastOccurred: new Date().toISOString(),
        }],
        config: {
          syncEnabled: integration.sync_enabled,
          webhookEnabled: integration.webhook_enabled,
          scopes: integration.scopes,
        },
        lastCheck: new Date().toISOString(),
      });
    }

  } catch (error) {
    logSecure('Bling health check API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json({
      error: 'Internal server error',
      message: 'Failed to check Bling integration health',
    }, { status: 500 });
  }
}
