/**
 * Mercado Livre Sync Trigger API
 * POST /api/meli/sync/trigger
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateApiAccess } from '@/app/api/_helpers/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { MeliSyncTriggerSchema } from '@/core/validation/meli.schemas';
import { MeliAdapter } from '@/core/adapters/meli/MeliAdapter';
import { decryptToken } from '@/lib/crypto';
import { logSecure } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Validate authentication and get context
    const { context, error } = await validateApiAccess();
    if (error) return error;

    // Parse and validate request body
    const body = await request.json();
    const { data: syncRequest, error: validationError } = MeliSyncTriggerSchema.safeParse(body);
    
    if (validationError) {
      return NextResponse.json({
        error: 'Invalid sync request',
        details: validationError.errors,
      }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();

    // Get Meli integration
    const { data: integration, error: integrationError } = await supabase
      .from('integrations_meli')
      .select('*')
      .eq('company_id', context.companyId)
      .single();

    if (integrationError || !integration) {
      return NextResponse.json({
        error: 'Integration not found',
        message: 'Mercado Livre integration not configured for this company',
      }, { status: 404 });
    }

    if (!integration.sync_enabled) {
      return NextResponse.json({
        error: 'Sync disabled',
        message: 'Mercado Livre sync is disabled for this company',
      }, { status: 400 });
    }

    // Decrypt tokens and initialize adapter
    const accessToken = decryptToken(integration.token_ciphertext);
    const refreshToken = decryptToken(integration.refresh_ciphertext);

    const adapter = new MeliAdapter({
      baseUrl: 'https://api.mercadolibre.com',
      clientId: process.env.MELI_CLIENT_ID!,
      clientSecret: process.env.MELI_CLIENT_SECRET!,
      redirectUri: process.env.MELI_REDIRECT_URI!,
      siteId: integration.site_id,
    });

    adapter.setTokens(
      accessToken,
      refreshToken,
      parseInt(integration.user_id),
      new Date(Date.now() + 3600000) // 1 hour from now
    );

    // Create ETL run record
    const { data: etlRun, error: etlError } = await supabase
      .from('etl_runs')
      .insert({
        company_id: context.companyId,
        source: 'meli',
        resource: syncRequest.resource,
        status: 'running',
        started_at: new Date().toISOString(),
        triggered_by: context.userId,
        config: {
          force: syncRequest.force,
          filters: syncRequest.filters || {},
          siteId: integration.site_id,
          userId: integration.user_id,
        },
      })
      .select()
      .single();

    if (etlError) {
      logSecure('Failed to create ETL run', {
        companyId: context.companyId,
        resource: syncRequest.resource,
        error: etlError.message,
      });

      return NextResponse.json({
        error: 'Database error',
        message: 'Failed to create sync job',
      }, { status: 500 });
    }

    // Trigger sync based on resource type
    const syncResults = [];

    try {
      if (syncRequest.resource === 'orders' || syncRequest.resource === 'all') {
        const result = await syncOrders(adapter, supabase, context.companyId, syncRequest.filters);
        syncResults.push({ resource: 'orders', ...result });
      }

      if (syncRequest.resource === 'listings' || syncRequest.resource === 'all') {
        const result = await syncListings(adapter, supabase, context.companyId, syncRequest.filters);
        syncResults.push({ resource: 'listings', ...result });
      }

      if (syncRequest.resource === 'inventory' || syncRequest.resource === 'all') {
        const result = await syncInventory(adapter, supabase, context.companyId, syncRequest.filters);
        syncResults.push({ resource: 'inventory', ...result });
      }

      if (syncRequest.resource === 'fees' || syncRequest.resource === 'all') {
        const result = await syncFees(adapter, supabase, context.companyId, syncRequest.filters);
        syncResults.push({ resource: 'fees', ...result });
      }

      // Update ETL run as completed
      await supabase
        .from('etl_runs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          records_processed: syncResults.reduce((sum, r) => sum + (r.processed || 0), 0),
          records_inserted: syncResults.reduce((sum, r) => sum + (r.inserted || 0), 0),
          records_updated: syncResults.reduce((sum, r) => sum + (r.updated || 0), 0),
          summary: {
            results: syncResults,
            totalDuration: Date.now() - new Date(etlRun.started_at).getTime(),
          },
        })
        .eq('id', etlRun.id);

      // Update integration sync timestamps
      const updateData: any = { updated_at: new Date().toISOString() };
      
      if (syncRequest.resource === 'orders' || syncRequest.resource === 'all') {
        updateData.last_sync_orders = new Date().toISOString();
      }
      if (syncRequest.resource === 'listings' || syncRequest.resource === 'all') {
        updateData.last_sync_listings = new Date().toISOString();
      }
      if (syncRequest.resource === 'inventory' || syncRequest.resource === 'all') {
        updateData.last_sync_inventory = new Date().toISOString();
      }
      if (syncRequest.resource === 'fees' || syncRequest.resource === 'all') {
        updateData.last_sync_fees = new Date().toISOString();
      }

      await supabase
        .from('integrations_meli')
        .update(updateData)
        .eq('company_id', context.companyId);

      logSecure('Meli sync completed successfully', {
        companyId: context.companyId,
        resource: syncRequest.resource,
        etlRunId: etlRun.id,
        results: syncResults,
      });

      return NextResponse.json({
        success: true,
        message: 'Sync triggered successfully',
        etlRunId: etlRun.id,
        results: syncResults,
      });

    } catch (syncError) {
      // Update ETL run as failed
      await supabase
        .from('etl_runs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: syncError instanceof Error ? syncError.message : 'Unknown sync error',
          summary: {
            results: syncResults,
            error: syncError instanceof Error ? syncError.message : 'Unknown sync error',
          },
        })
        .eq('id', etlRun.id);

      // Update integration error count
      await supabase
        .from('integrations_meli')
        .update({
          error_count: integration.error_count + 1,
          last_error: syncError instanceof Error ? syncError.message : 'Unknown sync error',
          last_error_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('company_id', context.companyId);

      logSecure('Meli sync failed', {
        companyId: context.companyId,
        resource: syncRequest.resource,
        etlRunId: etlRun.id,
        error: syncError instanceof Error ? syncError.message : 'Unknown error',
      });

      return NextResponse.json({
        error: 'Sync failed',
        message: syncError instanceof Error ? syncError.message : 'Unknown sync error',
        etlRunId: etlRun.id,
        partialResults: syncResults,
      }, { status: 500 });
    }

  } catch (error) {
    logSecure('Meli sync trigger API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json({
      error: 'Internal server error',
      message: 'Failed to trigger Mercado Livre sync',
    }, { status: 500 });
  }
}

// Helper functions for sync operations
async function syncOrders(adapter: MeliAdapter, supabase: any, companyId: string, filters?: any) {
  // TODO: Implement order sync logic
  // This would use adapter.searchOrders() and adapter.getOrders() to map to fact_orders + fact_order_items
  return { processed: 0, inserted: 0, updated: 0 };
}

async function syncListings(adapter: MeliAdapter, supabase: any, companyId: string, filters?: any) {
  // TODO: Implement listing sync logic
  // This would use adapter.getUserItems() and adapter.getItems() to map to dim_products
  return { processed: 0, inserted: 0, updated: 0 };
}

async function syncInventory(adapter: MeliAdapter, supabase: any, companyId: string, filters?: any) {
  // TODO: Implement inventory sync logic
  // This would use adapter.getItemInventory() to map to fact_stock_snapshot
  return { processed: 0, inserted: 0, updated: 0 };
}

async function syncFees(adapter: MeliAdapter, supabase: any, companyId: string, filters?: any) {
  // TODO: Implement fees sync logic
  // This would use adapter.getItemFees() to map to fact_fees
  return { processed: 0, inserted: 0, updated: 0 };
}
