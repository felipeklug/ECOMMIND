/**
 * Missions Open API Endpoint
 * Returns open missions count data
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateApiAccess, logSecure } from '@/app/api/_helpers/auth';
import { createClient } from '@/lib/supabase/server';
import { createTimer } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const timer = createTimer('dashboard_missions_open');
  
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

    // Get all missions for the company
    const { data: missions, error: missionsError } = await supabase
      .from('missions')
      .select('status, priority')
      .eq('company_id', companyId);

    if (missionsError) {
      throw new Error(`Failed to fetch missions: ${missionsError.message}`);
    }

    // Calculate counts
    const openStatuses = ['backlog', 'planned', 'in_progress'];
    const openMissions = missions?.filter(m => openStatuses.includes(m.status)) || [];
    
    const result = {
      open: openMissions.length,
      total: missions?.length || 0,
      priority: {
        P0: openMissions.filter(m => m.priority === 'P0').length,
        P1: openMissions.filter(m => m.priority === 'P1').length,
        P2: openMissions.filter(m => m.priority === 'P2').length,
      },
      byStatus: {
        backlog: missions?.filter(m => m.status === 'backlog').length || 0,
        planned: missions?.filter(m => m.status === 'planned').length || 0,
        in_progress: missions?.filter(m => m.status === 'in_progress').length || 0,
      },
    };

    timer.end({ companyId, open: result.open, total: result.total });

    logSecure('info', 'Missions open data retrieved', {
      companyId,
      open: result.open,
      total: result.total,
      priority: result.priority,
    });

    return NextResponse.json(result);

  } catch (error) {
    timer.end({ error: true });
    
    logSecure('error', 'Missions open API failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
