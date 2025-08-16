/**
 * Mercado Livre Orders API
 * GET /api/meli/orders
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateApiAccess } from '@/app/api/_helpers/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { MeliAdapter } from '@/core/adapters/meli/MeliAdapter';
import { decryptToken } from '@/lib/crypto';
import { logSecure } from '@/lib/logger';
import { z } from 'zod';

const OrdersQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  status: z.string().optional(),
  offset: z.coerce.number().min(0).default(0),
  limit: z.coerce.number().min(1).max(200).default(50),
  include_details: z.coerce.boolean().default(false),
});

export async function GET(request: NextRequest) {
  try {
    // Validate authentication and get context
    const { context, error } = await validateApiAccess();
    if (error) return error;

    // Parse and validate query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    
    const { data: params, error: validationError } = OrdersQuerySchema.safeParse(queryParams);
    if (validationError) {
      return NextResponse.json({
        error: 'Invalid query parameters',
        details: validationError.errors,
      }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();

    // Get Meli integration
    const { data: integration, error: integrationError } = await supabase
      .from('integrations_meli')
      .select('*')
      .eq('company_id', context.companyId)
      .single();

    if (integrationError || !integration) {
      return NextResponse.json({
        error: 'Integration not found',
        message: 'Mercado Livre integration not configured for this company',
      }, { status: 404 });
    }

    // Decrypt tokens and initialize adapter
    const accessToken = decryptToken(integration.token_ciphertext);
    const refreshToken = decryptToken(integration.refresh_ciphertext);

    const adapter = new MeliAdapter({
      baseUrl: 'https://api.mercadolibre.com',
      clientId: process.env.MELI_CLIENT_ID!,
      clientSecret: process.env.MELI_CLIENT_SECRET!,
      redirectUri: process.env.MELI_REDIRECT_URI!,
      siteId: integration.site_id,
    });

    adapter.setTokens(
      accessToken,
      refreshToken,
      parseInt(integration.user_id),
      new Date(Date.now() + 3600000) // 1 hour from now
    );

    // Build filters for Meli API
    const filters: any = {};
    
    if (params.from) {
      filters['order.date_created.from'] = params.from;
    }
    
    if (params.to) {
      filters['order.date_created.to'] = params.to;
    }
    
    if (params.status) {
      filters['order.status'] = params.status;
    }

    // Search orders
    const ordersResult = await adapter.searchOrders({
      sellerId: parseInt(integration.user_id),
      offset: params.offset,
      limit: params.limit,
      filters,
    });

    let orders = [];
    
    if (params.include_details && ordersResult.items.length > 0) {
      // Get detailed order information
      orders = await adapter.getOrders(ordersResult.items);
    } else {
      // Return just order IDs
      orders = ordersResult.items.map(id => ({ id }));
    }

    logSecure('Meli orders retrieved', {
      companyId: context.companyId,
      count: orders.length,
      total: ordersResult.pagination.total,
      offset: params.offset,
      limit: params.limit,
      includeDetails: params.include_details,
    });

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        total: ordersResult.pagination.total,
        offset: ordersResult.pagination.offset,
        limit: ordersResult.pagination.limit,
        hasNextPage: ordersResult.pagination.hasNextPage,
        nextOffset: ordersResult.pagination.hasNextPage 
          ? ordersResult.pagination.offset + ordersResult.pagination.limit 
          : null,
      },
      filters: {
        from: params.from,
        to: params.to,
        status: params.status,
      },
      meta: {
        siteId: integration.site_id,
        userId: integration.user_id,
        lastSync: integration.last_sync_orders,
      },
    });

  } catch (error) {
    logSecure('Meli orders API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json({
      error: 'Internal server error',
      message: 'Failed to retrieve Mercado Livre orders',
    }, { status: 500 });
  }
}
