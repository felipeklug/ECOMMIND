/**
 * Revenue MTD API Endpoint
 * Returns month-to-date revenue data
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateApiAccess, logSecure } from '@/app/api/_helpers/auth';
import { createClient } from '@/lib/supabase/server';
import { createTimer } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const timer = createTimer('dashboard_revenue_mtd');
  
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

    // Query current month revenue
    const { data: currentData, error: currentError } = await supabase
      .from('order_items')
      .select('qty, unit_price')
      .eq('company_id', companyId)
      .gte('created_dt', currentMonthStart.toISOString())
      .lte('created_dt', currentMonthEnd.toISOString());

    if (currentError) {
      throw new Error(`Failed to fetch current month data: ${currentError.message}`);
    }

    // Query previous month revenue
    const { data: previousData, error: previousError } = await supabase
      .from('order_items')
      .select('qty, unit_price')
      .eq('company_id', companyId)
      .gte('created_dt', previousMonthStart.toISOString())
      .lte('created_dt', previousMonthEnd.toISOString());

    if (previousError) {
      throw new Error(`Failed to fetch previous month data: ${previousError.message}`);
    }

    // Calculate totals
    const current = currentData?.reduce((sum, item) => sum + (item.qty * item.unit_price), 0) || 0;
    const previous = previousData?.reduce((sum, item) => sum + (item.qty * item.unit_price), 0) || 0;
    
    // Calculate change percentage
    const changePercent = previous > 0 ? ((current - previous) / previous) * 100 : 0;

    const result = {
      current,
      previous,
      changePercent,
      period: `${currentMonthStart.getFullYear()}-${String(currentMonthStart.getMonth() + 1).padStart(2, '0')}`,
    };

    timer.end({ companyId, current, previous, changePercent });

    logSecure('info', 'Revenue MTD data retrieved', {
      companyId,
      current,
      previous,
      changePercent,
    });

    return NextResponse.json(result);

  } catch (error) {
    timer.end({ error: true });
    
    logSecure('error', 'Revenue MTD API failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
