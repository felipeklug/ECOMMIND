/**
 * Mercado Livre Health Check API
 * GET /api/meli/health
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateApiAccess } from '@/app/api/_helpers/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { MeliAdapter } from '@/core/adapters/meli/MeliAdapter';
import { decryptToken } from '@/lib/crypto';
import { logSecure } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    // Validate authentication and get context
    const { context, error } = await validateApiAccess();
    if (error) return error;

    const supabase = createSupabaseServerClient();

    // Get Meli integration for this company
    const { data: integration, error: integrationError } = await supabase
      .from('integrations_meli')
      .select('*')
      .eq('company_id', context.companyId)
      .single();

    if (integrationError || !integration) {
      return NextResponse.json({
        status: 'not_configured',
        message: 'Mercado Livre integration not configured',
        connected: false,
        lastSync: null,
        errors: [],
      }, { status: 200 });
    }

    try {
      // Decrypt tokens and test connection
      const accessToken = decryptToken(integration.token_ciphertext);
      const refreshToken = decryptToken(integration.refresh_ciphertext);

      const adapter = new MeliAdapter({
        baseUrl: 'https://api.mercadolibre.com',
        clientId: process.env.MELI_CLIENT_ID!,
        clientSecret: process.env.MELI_CLIENT_SECRET!,
        redirectUri: process.env.MELI_REDIRECT_URI!,
        siteId: integration.site_id || 'MLB',
      });

      adapter.setTokens(
        accessToken,
        refreshToken,
        parseInt(integration.user_id),
        new Date(Date.now() + 3600000) // 1 hour from now
      );

      // Perform health check
      const healthResult = await adapter.healthCheck();

      // Get sync status
      const syncStatus = {
        orders: integration.last_sync_orders,
        listings: integration.last_sync_listings,
        inventory: integration.last_sync_inventory,
        fees: integration.last_sync_fees,
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

      // Get webhook events count (last 24h)
      const { count: webhookCount } = await supabase
        .from('meli_webhook_events')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', context.companyId)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      logSecure('Meli health check completed', {
        companyId: context.companyId,
        status: healthResult.status,
        tokenValid: healthResult.tokenValid,
        userId: healthResult.userId,
        errorCount: integration.error_count,
        webhookCount: webhookCount || 0,
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
          siteId: integration.site_id,
          userId: integration.user_id,
        },
        stats: {
          webhookEventsLast24h: webhookCount || 0,
        },
        lastCheck: healthResult.lastCheck,
      });

    } catch (tokenError) {
      logSecure('Meli health check failed - token error', {
        companyId: context.companyId,
        error: tokenError instanceof Error ? tokenError.message : 'Unknown error',
      });

      return NextResponse.json({
        status: 'unhealthy',
        message: 'Token validation failed',
        connected: false,
        lastSync: {
          orders: integration.last_sync_orders,
          listings: integration.last_sync_listings,
          inventory: integration.last_sync_inventory,
          fees: integration.last_sync_fees,
        },
        errors: [{
          message: tokenError instanceof Error ? tokenError.message : 'Token validation failed',
          count: 1,
          lastOccurred: new Date().toISOString(),
        }],
        config: {
          syncEnabled: integration.sync_enabled,
          webhookEnabled: integration.webhook_enabled,
          siteId: integration.site_id,
          userId: integration.user_id,
        },
        lastCheck: new Date().toISOString(),
      });
    }

  } catch (error) {
    logSecure('Meli health check API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json({
      error: 'Internal server error',
      message: 'Failed to check Mercado Livre integration health',
    }, { status: 500 });
  }
}
