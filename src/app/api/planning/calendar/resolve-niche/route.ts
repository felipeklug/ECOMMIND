/**
 * Resolve Niche API
 * Analyzes company data to resolve primary niches
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateApiAccess, logSecure } from '@/app/api/_helpers/auth';
import { createTimer } from '@/lib/logger';
import { NicheResolver } from '@/core/services/niche-resolver';

const ResolveNicheSchema = z.object({
  force_refresh: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  const timer = createTimer('calendar_resolve_niche');
  
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
    const { force_refresh } = ResolveNicheSchema.parse(body);

    // Initialize niche resolver
    const nicheResolver = new NicheResolver(companyId);

    // Resolve niches
    const resolvedNiches = await nicheResolver.resolveNiches();

    const result = {
      success: true,
      niches: {
        primary: resolvedNiches.primary_niches,
        all: resolvedNiches.all_niches.map(n => ({
          niche: n.niche,
          score: Math.round(n.score * 100) / 100,
          confidence: Math.round(n.confidence * 100) / 100,
          categories: n.categories.slice(0, 3), // Limit for response size
          product_count: n.product_count,
        })),
        confidence_score: Math.round(resolvedNiches.confidence_score * 100) / 100,
        data_sources: resolvedNiches.data_sources,
        last_resolved: resolvedNiches.last_resolved,
      },
      summary: {
        primary_count: resolvedNiches.primary_niches.length,
        total_niches: resolvedNiches.all_niches.length,
        confidence_level: resolvedNiches.confidence_score > 0.7 ? 'high' : 
                         resolvedNiches.confidence_score > 0.4 ? 'medium' : 'low',
        data_sources_count: resolvedNiches.data_sources.length,
      },
    };

    timer.end({ 
      companyId, 
      primaryNiches: resolvedNiches.primary_niches.length,
      totalNiches: resolvedNiches.all_niches.length,
      confidence: resolvedNiches.confidence_score,
    });

    logSecure('info', 'Niches resolved successfully', {
      companyId,
      userId,
      primaryNiches: resolvedNiches.primary_niches,
      confidence: resolvedNiches.confidence_score,
      dataSources: resolvedNiches.data_sources,
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
    
    logSecure('error', 'Resolve niche API failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
