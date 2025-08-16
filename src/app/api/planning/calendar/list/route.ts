/**
 * Calendar Events List API
 * Returns calendar events for a date range
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateApiAccess, logSecure } from '@/app/api/_helpers/auth';
import { createClient } from '@/lib/supabase/server';
import { createTimer } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const timer = createTimer('calendar_list');
  
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

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const channel = searchParams.get('channel');
    const category = searchParams.get('category');
    const importance = searchParams.get('importance');

    const supabase = createClient();

    // Build query
    let query = supabase
      .from('calendar_events')
      .select('*')
      .eq('company_id', companyId)
      .order('date', { ascending: true });

    // Apply filters
    if (from) {
      query = query.gte('date', from);
    }
    
    if (to) {
      query = query.lte('date', to);
    }
    
    if (channel && channel !== 'all') {
      if (channel === 'global') {
        query = query.is('channel', null);
      } else {
        query = query.eq('channel', channel);
      }
    }
    
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    
    if (importance && importance !== 'all') {
      query = query.eq('importance', importance);
    }

    const { data: events, error: eventsError } = await query;

    if (eventsError) {
      throw new Error(`Failed to fetch events: ${eventsError.message}`);
    }

    // Group events by date for easier frontend consumption
    const eventsByDate = (events || []).reduce((acc, event) => {
      const date = event.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(event);
      return acc;
    }, {} as Record<string, any[]>);

    const result = {
      events: events || [],
      eventsByDate,
      total: events?.length || 0,
      filters: {
        from,
        to,
        channel,
        category,
        importance,
      },
    };

    timer.end({ 
      companyId, 
      total: result.total,
      dateRange: from && to ? `${from} to ${to}` : 'all',
    });

    logSecure('info', 'Calendar events retrieved', {
      companyId,
      total: result.total,
      filters: { from, to, channel, category, importance },
    });

    return NextResponse.json(result);

  } catch (error) {
    timer.end({ error: true });
    
    logSecure('error', 'Calendar list API failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
