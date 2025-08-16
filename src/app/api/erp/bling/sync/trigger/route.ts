/**
 * Bling ERP Sync Trigger API
 * POST /api/erp/bling/sync/trigger
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateApiAccess } from '@/app/api/_helpers/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { BlingSyncTriggerSchema } from '@/core/validation/bling.schemas';
import { BlingAdapter } from '@/core/adapters/erp/BlingAdapter';
import { decryptToken } from '@/lib/crypto';
import { logSecure } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Validate authentication and get context
    const { context, error } = await validateApiAccess();
    if (error) return error;

    // Parse and validate request body
    const body = await request.json();
    const { data: syncRequest, error: validationError } = BlingSyncTriggerSchema.safeParse(body);
    
    if (validationError) {
      return NextResponse.json({
        error: 'Invalid sync request',
        details: validationError.errors,
      }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();

    // Get Bling integration
    const { data: integration, error: integrationError } = await supabase
      .from('integrations_bling')
      .select('*')
      .eq('company_id', context.companyId)
      .single();

    if (integrationError || !integration) {
      return NextResponse.json({
        error: 'Integration not found',
        message: 'Bling integration not configured for this company',
      }, { status: 404 });
    }

    if (!integration.sync_enabled) {
      return NextResponse.json({
        error: 'Sync disabled',
        message: 'Bling sync is disabled for this company',
      }, { status: 400 });
    }

    // Decrypt tokens and initialize adapter
    const accessToken = decryptToken(integration.token_ciphertext);
    const refreshToken = decryptToken(integration.refresh_ciphertext);

    const adapter = new BlingAdapter();
    adapter.setTokens(
      accessToken,
      refreshToken,
      new Date(Date.now() + 3600000) // 1 hour from now
    );

    // Create ETL run record
    const { data: etlRun, error: etlError } = await supabase
      .from('etl_runs')
      .insert({
        company_id: context.companyId,
        source: 'bling',
        resource: syncRequest.resource,
        status: 'running',
        started_at: new Date().toISOString(),
        triggered_by: context.userId,
        config: {
          force: syncRequest.force,
          filters: syncRequest.filters || {},
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
      if (syncRequest.resource === 'products' || syncRequest.resource === 'all') {
        const result = await syncProducts(adapter, supabase, context.companyId, syncRequest.filters);
        syncResults.push({ resource: 'products', ...result });
      }

      if (syncRequest.resource === 'orders' || syncRequest.resource === 'all') {
        const result = await syncOrders(adapter, supabase, context.companyId, syncRequest.filters);
        syncResults.push({ resource: 'orders', ...result });
      }

      if (syncRequest.resource === 'finance' || syncRequest.resource === 'all') {
        const result = await syncFinance(adapter, supabase, context.companyId, syncRequest.filters);
        syncResults.push({ resource: 'finance', ...result });
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

      logSecure('Bling sync completed successfully', {
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

      logSecure('Bling sync failed', {
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
    logSecure('Bling sync trigger API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json({
      error: 'Internal server error',
      message: 'Failed to trigger Bling sync',
    }, { status: 500 });
  }
}

// Helper functions for sync operations
async function syncProducts(adapter: BlingAdapter, supabase: any, companyId: string, filters?: any) {
  // TODO: Implement product sync logic
  // This would use adapter.listProducts() and map to dim_products
  return { processed: 0, inserted: 0, updated: 0 };
}

async function syncOrders(adapter: BlingAdapter, supabase: any, companyId: string, filters?: any) {
  // TODO: Implement order sync logic
  // This would use adapter.listOrders() and map to fact_orders + fact_order_items
  return { processed: 0, inserted: 0, updated: 0 };
}

async function syncFinance(adapter: BlingAdapter, supabase: any, companyId: string, filters?: any) {
  // TODO: Implement finance sync logic
  // This would use adapter.listAccountsPayable/Receivable and map to fact_finance_ap/ar
  return { processed: 0, inserted: 0, updated: 0 };
}
