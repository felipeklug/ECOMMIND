/**
 * Market Intelligence Upload API
 * Handles CSV/JSON upload for market data
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateApiAccess, logSecure } from '@/app/api/_helpers/auth';
import { createClient } from '@/lib/supabase/server';
import { createTimer } from '@/lib/logger';
import { MarketDatasetNormalizer } from '@/core/rules/normalizers';

const UploadSchema = z.object({
  period_start: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid start date'),
  period_end: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid end date'),
  scope: z.enum(['niche', 'category']),
  file_name: z.string().optional(),
  data: z.array(z.record(z.any())).min(1, 'Data array cannot be empty'),
});

export async function POST(request: NextRequest) {
  const timer = createTimer('market_upload');
  
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
    const validatedData = UploadSchema.parse(body);

    // Validate date range
    const startDate = new Date(validatedData.period_start);
    const endDate = new Date(validatedData.period_end);
    
    if (startDate >= endDate) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Normalize the data
    const { valid: normalizedRecords, errors } = MarketDatasetNormalizer.normalize(validatedData.data);

    if (normalizedRecords.length === 0) {
      return NextResponse.json(
        { 
          error: 'No valid records found',
          validation_errors: errors,
        },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Create the dataset
    const { data: dataset, error: datasetError } = await supabase
      .from('market_datasets')
      .insert({
        company_id: companyId,
        period_start: startDate.toISOString().split('T')[0],
        period_end: endDate.toISOString().split('T')[0],
        scope: validatedData.scope,
        source: 'upload',
        meta: {
          file_name: validatedData.file_name || 'upload.csv',
          total_rows: validatedData.data.length,
          valid_rows: normalizedRecords.length,
          error_rows: errors.length,
          uploaded_at: new Date().toISOString(),
        },
        created_by: userId,
      })
      .select()
      .single();

    if (datasetError) {
      throw new Error(`Failed to create dataset: ${datasetError.message}`);
    }

    // Insert records in batches
    const batchSize = 100;
    const batches = [];
    
    for (let i = 0; i < normalizedRecords.length; i += batchSize) {
      const batch = normalizedRecords.slice(i, i + batchSize).map(record => ({
        company_id: companyId,
        dataset_id: dataset.id,
        channel: record.channel,
        category: record.category,
        identifier: record.identifier,
        record_type: record.record_type,
        title: record.title,
        price: record.price,
        price_median: record.price_median,
        demand_index: record.demand_index,
        growth_rate: record.growth_rate,
        sellers_top: record.sellers_top,
        units_sold_est: record.units_sold_est,
        revenue_est: record.revenue_est,
        attributes: record.attributes,
      }));

      batches.push(batch);
    }

    // Insert all batches
    let totalInserted = 0;
    for (const batch of batches) {
      const { error: insertError } = await supabase
        .from('market_records')
        .insert(batch);

      if (insertError) {
        logSecure('error', 'Failed to insert market records batch', {
          companyId,
          datasetId: dataset.id,
          batchSize: batch.length,
          error: insertError.message,
        });
        // Continue with other batches
      } else {
        totalInserted += batch.length;
      }
    }

    const result = {
      success: true,
      dataset: {
        id: dataset.id,
        period_start: dataset.period_start,
        period_end: dataset.period_end,
        scope: dataset.scope,
      },
      summary: {
        total_rows: validatedData.data.length,
        valid_rows: normalizedRecords.length,
        inserted_rows: totalInserted,
        error_rows: errors.length,
      },
      validation_errors: errors.length > 0 ? errors.slice(0, 10) : [], // Limit errors shown
    };

    timer.end({ 
      companyId, 
      datasetId: dataset.id,
      totalRows: result.summary.total_rows,
      validRows: result.summary.valid_rows,
      insertedRows: result.summary.inserted_rows,
    });

    logSecure('info', 'Market dataset uploaded successfully', {
      companyId,
      userId,
      datasetId: dataset.id,
      scope: dataset.scope,
      period: `${dataset.period_start} to ${dataset.period_end}`,
      summary: result.summary,
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
    
    logSecure('error', 'Market upload API failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
