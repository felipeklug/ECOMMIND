/**
 * Calendar Curate API
 * Curates calendar events based on company niches
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateApiAccess, logSecure } from '@/app/api/_helpers/auth';
import { createTimer } from '@/lib/logger';
import { CalendarCurator } from '@/core/services/calendar-curator';

const CurateCalendarSchema = z.object({
  force_refresh: z.boolean().default(false),
  include_global: z.boolean().default(true),
  max_events_per_niche: z.number().min(1).max(50).default(20),
  importance_threshold: z.enum(['low', 'medium', 'high']).default('low'),
});

export async function POST(request: NextRequest) {
  const timer = createTimer('calendar_curate');
  
  try {
    // Validate authentication
    const { context, error } = await validateApiAccess();
    if (error) return error;

    const { userId, companyId, isAuthenticated } = context;
    
    if (!isAuthenticated || !companyId || !userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const options = CurateCalendarSchema.parse(body);

    // Initialize calendar curator
    const curator = new CalendarCurator(companyId);

    // Curate calendar
    const curationResult = await curator.curateCalendar(options);

    const result = {
      success: true,
      curation: {
        events_added: curationResult.events_added,
        events_updated: curationResult.events_updated,
        events_silenced: curationResult.events_silenced,
        niches_applied: curationResult.niches_applied,
        confidence_score: Math.round(curationResult.confidence_score * 100) / 100,
        last_curated: curationResult.last_curated,
      },
      summary: {
        total_changes: curationResult.events_added + curationResult.events_updated,
        niches_count: curationResult.niches_applied.length,
        confidence_level: curationResult.confidence_score > 0.7 ? 'high' : 
                         curationResult.confidence_score > 0.4 ? 'medium' : 'low',
      },
      next_steps: [
        'Review curated events in calendar',
        'Create missions for upcoming events',
        'Configure lead times for better preparation',
      ],
    };

    timer.end({ 
      companyId, 
      eventsAdded: curationResult.events_added,
      eventsUpdated: curationResult.events_updated,
      nichesApplied: curationResult.niches_applied.length,
    });

    logSecure('info', 'Calendar curated successfully', {
      companyId,
      userId,
      eventsAdded: curationResult.events_added,
      eventsUpdated: curationResult.events_updated,
      eventsSilenced: curationResult.events_silenced,
      nichesApplied: curationResult.niches_applied,
      confidence: curationResult.confidence_score,
    });

    return NextResponse.json(result);

  } catch (error) {
    timer.end({ error: true });
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        },
        { status: 400 }
      );
    }
    
    logSecure('error', 'Calendar curate API failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
