/**
 * Mercado Livre Listings API
 * GET /api/meli/listings
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateApiAccess } from '@/app/api/_helpers/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { MeliAdapter } from '@/core/adapters/meli/MeliAdapter';
import { decryptToken } from '@/lib/crypto';
import { logSecure } from '@/lib/logger';
import { z } from 'zod';

const ListingsQuerySchema = z.object({
  status: z.enum(['active', 'paused', 'closed', 'under_review', 'inactive']).optional(),
  category_id: z.string().optional(),
  listing_type_id: z.enum(['gold_special', 'gold_pro', 'gold', 'silver', 'bronze', 'free']).optional(),
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
    
    const { data: params, error: validationError } = ListingsQuerySchema.safeParse(queryParams);
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
    
    if (params.status) {
      filters.status = params.status;
    }
    
    if (params.category_id) {
      filters.category_id = params.category_id;
    }
    
    if (params.listing_type_id) {
      filters.listing_type_id = params.listing_type_id;
    }

    // Get user items (listings)
    const listingsResult = await adapter.getUserItems({
      userId: parseInt(integration.user_id),
      offset: params.offset,
      limit: params.limit,
      filters,
    });

    let listings = [];
    
    if (params.include_details && listingsResult.items.length > 0) {
      // Get detailed listing information
      listings = await adapter.getItems(listingsResult.items);
    } else {
      // Return just listing IDs
      listings = listingsResult.items.map(id => ({ id }));
    }

    // Get mapping information if available
    let mappings = [];
    if (listingsResult.items.length > 0) {
      const { data: mappingData } = await supabase
        .from('meli_listing_mapping')
        .select('meli_id, internal_sku, listing_type, status, sync_enabled')
        .eq('company_id', context.companyId)
        .in('meli_id', listingsResult.items);
      
      mappings = mappingData || [];
    }

    // Enhance listings with mapping information
    const enhancedListings = listings.map(listing => {
      const mapping = mappings.find(m => m.meli_id === (listing.id || listing));
      return {
        ...listing,
        mapping: mapping ? {
          internal_sku: mapping.internal_sku,
          listing_type: mapping.listing_type,
          status: mapping.status,
          sync_enabled: mapping.sync_enabled,
        } : null,
      };
    });

    logSecure('Meli listings retrieved', {
      companyId: context.companyId,
      count: listings.length,
      total: listingsResult.pagination.total,
      offset: params.offset,
      limit: params.limit,
      includeDetails: params.include_details,
      mappedCount: mappings.length,
    });

    return NextResponse.json({
      success: true,
      data: enhancedListings,
      pagination: {
        total: listingsResult.pagination.total,
        offset: listingsResult.pagination.offset,
        limit: listingsResult.pagination.limit,
        hasNextPage: listingsResult.pagination.hasNextPage,
        nextOffset: listingsResult.pagination.hasNextPage 
          ? listingsResult.pagination.offset + listingsResult.pagination.limit 
          : null,
      },
      filters: {
        status: params.status,
        category_id: params.category_id,
        listing_type_id: params.listing_type_id,
      },
      meta: {
        siteId: integration.site_id,
        userId: integration.user_id,
        lastSync: integration.last_sync_listings,
        mappedListings: mappings.length,
        totalListings: listingsResult.pagination.total,
      },
    });

  } catch (error) {
    logSecure('Meli listings API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json({
      error: 'Internal server error',
      message: 'Failed to retrieve Mercado Livre listings',
    }, { status: 500 });
  }
}
