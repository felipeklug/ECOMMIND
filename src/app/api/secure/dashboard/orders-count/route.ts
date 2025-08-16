/**
 * Orders Count API Endpoint
 * Returns orders count data
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateApiAccess, logSecure } from '@/app/api/_helpers/auth';
import { createClient } from '@/lib/supabase/server';
import { createTimer } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const timer = createTimer('dashboard_orders_count');
  
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

    // Get current month dates
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // Get previous month dates
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Query current month orders
    const { count: currentCount, error: currentError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .gte('order_dt', currentMonthStart.toISOString())
      .lte('order_dt', currentMonthEnd.toISOString());

    if (currentError) {
      throw new Error(`Failed to fetch current month orders: ${currentError.message}`);
    }

    // Query previous month orders
    const { count: previousCount, error: previousError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .gte('order_dt', previousMonthStart.toISOString())
      .lte('order_dt', previousMonthEnd.toISOString());

    if (previousError) {
      throw new Error(`Failed to fetch previous month orders: ${previousError.message}`);
    }

    // Query total historic orders
    const { count: totalCount, error: totalError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId);

    if (totalError) {
      throw new Error(`Failed to fetch total orders: ${totalError.message}`);
    }

    // Calculate change percentage
    const currentMonth = currentCount || 0;
    const previousMonth = previousCount || 0;
    const changePercent = previousMonth > 0 ? ((currentMonth - previousMonth) / previousMonth) * 100 : 0;

    const result = {
      currentMonth,
      previousMonth,
      changePercent,
      totalHistoric: totalCount || 0,
    };

    timer.end({ companyId, currentMonth, previousMonth, changePercent });

    logSecure('info', 'Orders count data retrieved', {
      companyId,
      currentMonth,
      previousMonth,
      changePercent,
      totalHistoric: result.totalHistoric,
    });

    return NextResponse.json(result);

  } catch (error) {
    timer.end({ error: true });
    
    logSecure('error', 'Orders count API failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
