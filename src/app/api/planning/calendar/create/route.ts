/**
 * Calendar Event Create API
 * Creates a new calendar event
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateApiAccess, logSecure } from '@/app/api/_helpers/auth';
import { createClient } from '@/lib/supabase/server';
import { createTimer } from '@/lib/logger';

const CreateEventSchema = z.object({
  date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date format'),
  title: z.string().min(1).max(200),
  channel: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  importance: z.enum(['low', 'medium', 'high']).default('medium'),
  metadata: z.record(z.any()).optional(),
});

export async function POST(request: NextRequest) {
  const timer = createTimer('calendar_create');
  
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
    const validatedData = CreateEventSchema.parse(body);

    // Normalize channel
    let channel = validatedData.channel?.toLowerCase().trim() || null;
    if (channel === 'all' || channel === 'global') {
      channel = null;
    } else if (channel && !['meli', 'shopee', 'amazon', 'site'].includes(channel)) {
      return NextResponse.json(
        { error: 'Invalid channel. Must be one of: meli, shopee, amazon, site, or null for global' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Check for duplicate events (same date, title, channel for company)
    const { data: existingEvent } = await supabase
      .from('calendar_events')
      .select('id')
      .eq('company_id', companyId)
      .eq('date', new Date(validatedData.date).toISOString().split('T')[0])
      .eq('title', validatedData.title.trim())
      .eq('channel', channel)
      .single();

    if (existingEvent) {
      return NextResponse.json(
        { error: 'Event already exists for this date and channel' },
        { status: 409 }
      );
    }

    // Create the event
    const { data: newEvent, error: createError } = await supabase
      .from('calendar_events')
      .insert({
        company_id: companyId,
        date: new Date(validatedData.date).toISOString().split('T')[0],
        title: validatedData.title.trim(),
        channel,
        category: validatedData.category?.trim() || null,
        importance: validatedData.importance,
        source: 'manual',
        metadata: {
          ...validatedData.metadata,
          created_by_user: true,
        },
        created_by: userId,
      })
      .select()
      .single();

    if (createError) {
      throw new Error(`Failed to create event: ${createError.message}`);
    }

    timer.end({ 
      companyId, 
      eventId: newEvent.id,
      date: newEvent.date,
    });

    logSecure('info', 'Calendar event created', {
      companyId,
      userId,
      eventId: newEvent.id,
      title: newEvent.title,
      date: newEvent.date,
      channel: newEvent.channel,
      importance: newEvent.importance,
    });

    return NextResponse.json({
      success: true,
      event: newEvent,
    });

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
    
    logSecure('error', 'Calendar create API failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
