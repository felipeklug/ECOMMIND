/**
 * Shopee Sync Trigger API
 * POST /api/shopee/sync/trigger
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateApiAccess } from '@/app/api/_helpers/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ShopeeSyncTriggerSchema } from '@/core/validation/shopee.schemas';
import { ShopeeAdapter } from '@/core/adapters/shopee/ShopeeAdapter';
import { decryptToken } from '@/lib/crypto';
import { logSecure } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Validate authentication and get context
    const { context, error } = await validateApiAccess();
    if (error) return error;

    // Parse and validate request body
    const body = await request.json();
    const { data: syncRequest, error: validationError } = ShopeeSyncTriggerSchema.safeParse(body);
    
    if (validationError) {
      return NextResponse.json({
        error: 'Invalid sync request',
        details: validationError.errors,
      }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();

    // Get Shopee integration
    const { data: integration, error: integrationError } = await supabase
      .from('integrations_shopee')
      .select('*')
      .eq('company_id', context.companyId)
      .single();

    if (integrationError || !integration) {
      return NextResponse.json({
        error: 'Integration not found',
        message: 'Shopee integration not configured for this company',
      }, { status: 404 });
    }

    if (!integration.sync_enabled) {
      return NextResponse.json({
        error: 'Sync disabled',
        message: 'Shopee sync is disabled for this company',
      }, { status: 400 });
    }

    // Decrypt tokens and initialize adapter
    const accessToken = decryptToken(integration.token_ciphertext);
    const refreshToken = decryptToken(integration.refresh_ciphertext);

    const adapter = new ShopeeAdapter({
      baseUrl: 'https://partner.shopeemobile.com',
      partnerId: integration.partner_id,
      partnerKey: process.env.SHOPEE_PARTNER_KEY!,
      redirectUri: process.env.SHOPEE_REDIRECT_URI!,
      region: integration.region,
    });

    adapter.setTokens(
      accessToken,
      refreshToken,
      parseInt(integration.shop_id),
      parseInt(integration.partner_id),
      new Date(Date.now() + 3600000) // 1 hour from now
    );

    // Create ETL run record
    const { data: etlRun, error: etlError } = await supabase
      .from('etl_runs')
      .insert({
        company_id: context.companyId,
        source: 'shopee',
        resource: syncRequest.resource,
        status: 'running',
        started_at: new Date().toISOString(),
        triggered_by: context.userId,
        config: {
          force: syncRequest.force,
          filters: syncRequest.filters || {},
          region: integration.region,
          shopId: integration.shop_id,
          partnerId: integration.partner_id,
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

      if (syncRequest.resource === 'stock' || syncRequest.resource === 'all') {
        const result = await syncStock(adapter, supabase, context.companyId, syncRequest.filters);
        syncResults.push({ resource: 'stock', ...result });
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
      if (syncRequest.resource === 'stock' || syncRequest.resource === 'all') {
        updateData.last_sync_stock = new Date().toISOString();
      }
      if (syncRequest.resource === 'fees' || syncRequest.resource === 'all') {
        updateData.last_sync_fees = new Date().toISOString();
      }

      await supabase
        .from('integrations_shopee')
        .update(updateData)
        .eq('company_id', context.companyId);

      logSecure('Shopee sync completed successfully', {
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
        .from('integrations_shopee')
        .update({
          error_count: integration.error_count + 1,
          last_error: syncError instanceof Error ? syncError.message : 'Unknown sync error',
          last_error_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('company_id', context.companyId);

      logSecure('Shopee sync failed', {
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
    logSecure('Shopee sync trigger API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json({
      error: 'Internal server error',
      message: 'Failed to trigger Shopee sync',
    }, { status: 500 });
  }
}

// Helper functions for sync operations
async function syncOrders(adapter: ShopeeAdapter, supabase: any, companyId: string, filters?: any) {
  // TODO: Implement order sync logic
  // This would use adapter.getOrderList() and adapter.getOrderDetail() to map to fact_orders + fact_order_items
  return { processed: 0, inserted: 0, updated: 0 };
}

async function syncListings(adapter: ShopeeAdapter, supabase: any, companyId: string, filters?: any) {
  // TODO: Implement listing sync logic
  // This would use adapter.getItemList() and adapter.getItemBaseInfo() to map to dim_products
  return { processed: 0, inserted: 0, updated: 0 };
}

async function syncStock(adapter: ShopeeAdapter, supabase: any, companyId: string, filters?: any) {
  // TODO: Implement stock sync logic
  // This would use adapter.getStockInfo() to map to fact_stock_snapshot
  return { processed: 0, inserted: 0, updated: 0 };
}

async function syncFees(adapter: ShopeeAdapter, supabase: any, companyId: string, filters?: any) {
  // TODO: Implement fees sync logic
  // This would use adapter.getOrderIncome() to map to fact_fees
  return { processed: 0, inserted: 0, updated: 0 };
}
