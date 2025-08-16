/**
 * Bling ERP OAuth Connect API
 * GET /api/erp/bling/connect
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateApiAccess } from '@/app/api/_helpers/auth';
import { BlingAdapter } from '@/core/adapters/erp/BlingAdapter';
import { logSecure } from '@/lib/logger';
import { z } from 'zod';

const ConnectQuerySchema = z.object({
  state: z.string().optional(),
  redirect_success: z.string().url().optional(),
  redirect_error: z.string().url().optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Validate authentication and get context
    const { context, error } = await validateApiAccess();
    if (error) return error;

    // Parse and validate query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    
    const { data: params, error: validationError } = ConnectQuerySchema.safeParse(queryParams);
    if (validationError) {
      return NextResponse.json({
        error: 'Invalid query parameters',
        details: validationError.errors,
      }, { status: 400 });
    }

    // Create state parameter with company context
    const state = JSON.stringify({
      companyId: context.companyId,
      userId: context.userId,
      timestamp: Date.now(),
      customState: params.state,
      redirectSuccess: params.redirect_success,
      redirectError: params.redirect_error,
    });

    // Encode state to base64 for URL safety
    const encodedState = Buffer.from(state).toString('base64');

    // Generate OAuth authorization URL
    const adapter = new BlingAdapter();
    const authUrl = adapter.getAuthUrl(encodedState);

    logSecure('Bling OAuth connect initiated', {
      companyId: context.companyId,
      userId: context.userId,
      hasCustomState: !!params.state,
      hasRedirectUrls: !!(params.redirect_success || params.redirect_error),
    });

    // Return authorization URL for client-side redirect
    return NextResponse.json({
      authUrl,
      state: encodedState,
      message: 'Redirect to authUrl to complete Bling authorization',
    });

  } catch (error) {
    logSecure('Bling connect API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json({
      error: 'Internal server error',
      message: 'Failed to initiate Bling OAuth connection',
    }, { status: 500 });
  }
}
