/**
 * Complete Onboarding API Route
 * Handles final onboarding submission with preferences and mission creation
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateApiAccess, logSecure } from '@/app/api/_helpers/auth';
import { preferencesService } from '@/core/services/preferences';
import { missionsService } from '@/core/services/missions';
import { completeOnboardingSchema } from '@/features/onboarding/schemas';
import { createTimer } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const timer = createTimer('onboarding_complete');
  
  try {
    // Validate authentication and get user context
    const { context, error } = await validateApiAccess();
    if (error) return error;

    const { userId, companyId, isAuthenticated } = context;
    
    if (!isAuthenticated || !userId || !companyId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    
    logSecure('info', 'Onboarding completion started', {
      userId,
      companyId,
      hasConnections: !!body.connections,
      hasPreferences: !!body.preferences,
      hasReview: !!body.review,
    });

    // Validate payload with Zod schema
    const validationResult = completeOnboardingSchema.safeParse(body);
    
    if (!validationResult.success) {
      logSecure('warn', 'Onboarding validation failed', {
        userId,
        companyId,
        errors: validationResult.error.flatten().fieldErrors,
      });
      
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const payload = validationResult.data;

    // Check if onboarding was already completed
    const hasCompleted = await preferencesService.hasCompletedOnboarding(companyId);
    if (hasCompleted) {
      logSecure('warn', 'Onboarding already completed', { userId, companyId });
      return NextResponse.json(
        { error: 'Onboarding already completed' },
        { status: 409 }
      );
    }

    // Complete onboarding process
    await preferencesService.completeOnboarding(userId, companyId, payload);

    // Create seed missions if requested
    let createdMissions = [];
    if (payload.review.createSeedMissions) {
      try {
        createdMissions = await missionsService.createSeedMissions(companyId, userId);
        
        logSecure('info', 'Seed missions created', {
          userId,
          companyId,
          missionCount: createdMissions.length,
          missionIds: createdMissions.map(m => m.id),
        });
      } catch (missionError) {
        // Log error but don't fail the onboarding
        logSecure('error', 'Failed to create seed missions', {
          userId,
          companyId,
          error: missionError,
        });
      }
    }

    // Log successful completion
    const duration = timer.end({
      userId,
      companyId,
      connectionsCount: payload.connections.channels.length,
      erpProvider: payload.connections.erp,
      marketScope: payload.preferences.marketScope,
      seedMissionsCreated: createdMissions.length,
    });

    logSecure('info', 'Onboarding completed successfully', {
      userId,
      companyId,
      duration,
      summary: {
        erp: payload.connections.erp,
        channels: payload.connections.channels,
        marketScope: payload.preferences.marketScope,
        fiscalRegime: payload.preferences.fiscal.isSimples ? 'simples' : 'other',
        missionsCreated: createdMissions.length,
      },
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
      data: {
        onboardingCompleted: true,
        missionsCreated: createdMissions.length,
        nextSteps: [
          'Explore your dashboard',
          'Complete your first missions',
          'Connect your sales channels',
        ],
      },
    });

  } catch (error) {
    timer.end({ error: true });
    
    logSecure('error', 'Onboarding completion failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to complete onboarding. Please try again.',
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
