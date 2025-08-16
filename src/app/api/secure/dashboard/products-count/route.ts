/**
 * Products Count API Endpoint
 * Returns products count and sync data
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateApiAccess, logSecure } from '@/app/api/_helpers/auth';
import { createClient } from '@/lib/supabase/server';
import { createTimer } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const timer = createTimer('dashboard_products_count');
  
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

    // Get total products count
    const { count: totalCount, error: totalError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId);

    if (totalError) {
      throw new Error(`Failed to fetch total products: ${totalError.message}`);
    }

    // Get active products count
    const { count: activeCount, error: activeError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('active', true);

    if (activeError) {
      throw new Error(`Failed to fetch active products: ${activeError.message}`);
    }

    // Get recently added products (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const { count: recentCount, error: recentError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .gte('created_dt', yesterday.toISOString());

    if (recentError) {
      throw new Error(`Failed to fetch recent products: ${recentError.message}`);
    }

    // Get last sync time from ETL checkpoints
    const { data: checkpointData, error: checkpointError } = await supabase
      .from('etl_checkpoints')
      .select('last_run_at')
      .eq('company_id', companyId)
      .eq('source', 'bling.products')
      .single();

    // Don't throw error if no checkpoint exists
    const lastSync = checkpointData?.last_run_at || null;

    const result = {
      total: totalCount || 0,
      active: activeCount || 0,
      recentlyAdded: recentCount || 0,
      lastSync,
    };

    timer.end({ companyId, total: result.total, active: result.active });

    logSecure('info', 'Products count data retrieved', {
      companyId,
      total: result.total,
      active: result.active,
      recentlyAdded: result.recentlyAdded,
    });

    return NextResponse.json(result);

  } catch (error) {
    timer.end({ error: true });
    
    logSecure('error', 'Products count API failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
