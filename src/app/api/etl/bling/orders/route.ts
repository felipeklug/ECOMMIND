/**
 * Bling Orders ETL Endpoint
 * Handles order synchronization from Bling ERP
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateApiAccess, logSecure } from '@/app/api/_helpers/auth';
import { etlService } from '@/core/services/etl';
import { createTimer } from '@/lib/logger';

/**
 * POST /api/etl/bling/orders
 * Sync orders from Bling ERP
 */
export async function POST(request: NextRequest) {
  const timer = createTimer('bling_orders_etl_endpoint');
  
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

    logSecure('info', 'Bling orders ETL started', { 
      companyId, 
      userId,
      endpoint: '/api/etl/bling/orders'
    });

    // Run ETL process
    const result = await etlService.syncOrders(companyId);

    timer.end({ 
      companyId, 
      success: result.success,
      pages: result.pages,
      rows: result.rows,
      duration: result.duration
    });

    if (result.success) {
      logSecure('info', 'Bling orders ETL completed successfully', {
        companyId,
        pages: result.pages,
        rows: result.rows,
        duration: result.duration,
      });

      return NextResponse.json({
        success: true,
        message: 'Orders synchronized successfully',
        data: {
          pages: result.pages,
          rows: result.rows,
          duration: result.duration,
        },
      });
    } else {
      logSecure('error', 'Bling orders ETL failed', {
        companyId,
        error: result.error,
        duration: result.duration,
      });

      return NextResponse.json(
        {
          success: false,
          error: result.error || 'ETL process failed',
          data: {
            pages: result.pages,
            rows: result.rows,
            duration: result.duration,
          },
        },
        { status: 500 }
      );
    }

  } catch (error) {
    timer.end({ error: true });
    
    logSecure('error', 'Bling orders ETL endpoint failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Failed to sync orders. Please try again.',
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to trigger ETL.' },
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

export async function PATCH() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
