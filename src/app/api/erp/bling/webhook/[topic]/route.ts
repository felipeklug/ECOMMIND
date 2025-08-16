/**
 * Bling ERP Webhook Handler API
 * POST /api/erp/bling/webhook/[topic]
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { BlingWebhookEventSchema } from '@/core/validation/bling.schemas';
import { BlingAdapter } from '@/core/adapters/erp/BlingAdapter';
import { logSecure } from '@/lib/logger';
import { z } from 'zod';

const TopicParamsSchema = z.object({
  topic: z.enum(['orders', 'products', 'status', 'stock']),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { topic: string } }
) {
  try {
    // Validate topic parameter
    const { data: validatedParams, error: paramsError } = TopicParamsSchema.safeParse(params);
    if (paramsError) {
      return NextResponse.json({
        error: 'Invalid webhook topic',
        details: paramsError.errors,
      }, { status: 400 });
    }

    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('x-bling-signature') || '';

    // Parse webhook payload
    let webhookData;
    try {
      webhookData = JSON.parse(rawBody);
    } catch (parseError) {
      logSecure('Bling webhook - invalid JSON', {
        topic: validatedParams.topic,
        error: parseError instanceof Error ? parseError.message : 'JSON parse error',
      });

      return NextResponse.json({
        error: 'Invalid JSON payload',
      }, { status: 400 });
    }

    // Validate webhook event structure
    const { data: event, error: eventError } = BlingWebhookEventSchema.safeParse(webhookData);
    if (eventError) {
      logSecure('Bling webhook - invalid event structure', {
        topic: validatedParams.topic,
        error: eventError.errors,
      });

      return NextResponse.json({
        error: 'Invalid webhook event structure',
        details: eventError.errors,
      }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();

    // Find company by webhook signature or event data
    // Note: In production, you'd need a way to identify the company
    // This could be done via a company-specific webhook URL or header
    const companyId = await identifyCompanyFromWebhook(event, signature, supabase);
    
    if (!companyId) {
      logSecure('Bling webhook - company not identified', {
        topic: validatedParams.topic,
        eventId: event.data.id,
      });

      return NextResponse.json({
        error: 'Company not identified',
      }, { status: 400 });
    }

    // Get integration config for signature verification
    const { data: integration, error: integrationError } = await supabase
      .from('integrations_bling')
      .select('webhook_secret, webhook_enabled')
      .eq('company_id', companyId)
      .single();

    if (integrationError || !integration) {
      logSecure('Bling webhook - integration not found', {
        topic: validatedParams.topic,
        companyId,
        eventId: event.data.id,
      });

      return NextResponse.json({
        error: 'Integration not found',
      }, { status: 404 });
    }

    if (!integration.webhook_enabled) {
      logSecure('Bling webhook - webhooks disabled', {
        topic: validatedParams.topic,
        companyId,
        eventId: event.data.id,
      });

      return NextResponse.json({
        error: 'Webhooks disabled',
      }, { status: 400 });
    }

    // Verify webhook signature if secret is configured
    if (integration.webhook_secret && signature) {
      const adapter = new BlingAdapter();
      const isValidSignature = adapter.validateWebhookSignature(
        rawBody,
        signature,
        integration.webhook_secret
      );

      if (!isValidSignature) {
        logSecure('Bling webhook - invalid signature', {
          topic: validatedParams.topic,
          companyId,
          eventId: event.data.id,
        });

        return NextResponse.json({
          error: 'Invalid webhook signature',
        }, { status: 401 });
      }
    }

    // Check for duplicate events
    const { data: existingEvent } = await supabase
      .from('bling_webhook_events')
      .select('id')
      .eq('company_id', companyId)
      .eq('event_type', event.event)
      .eq('external_id', event.data.id.toString())
      .single();

    if (existingEvent) {
      logSecure('Bling webhook - duplicate event ignored', {
        topic: validatedParams.topic,
        companyId,
        eventId: event.data.id,
        existingEventId: existingEvent.id,
      });

      return NextResponse.json({
        message: 'Event already processed',
        eventId: existingEvent.id,
      });
    }

    // Store webhook event
    const { data: storedEvent, error: storeError } = await supabase
      .from('bling_webhook_events')
      .insert({
        company_id: companyId,
        event_type: event.event,
        external_id: event.data.id.toString(),
        payload: webhookData,
        signature,
        processed: false,
        retry_count: 0,
      })
      .select()
      .single();

    if (storeError) {
      logSecure('Bling webhook - failed to store event', {
        topic: validatedParams.topic,
        companyId,
        eventId: event.data.id,
        error: storeError.message,
      });

      return NextResponse.json({
        error: 'Failed to store webhook event',
      }, { status: 500 });
    }

    // Process webhook event based on topic
    try {
      await processWebhookEvent(validatedParams.topic, event, companyId, supabase);

      // Mark event as processed
      await supabase
        .from('bling_webhook_events')
        .update({
          processed: true,
          processed_at: new Date().toISOString(),
        })
        .eq('id', storedEvent.id);

      logSecure('Bling webhook processed successfully', {
        topic: validatedParams.topic,
        companyId,
        eventId: event.data.id,
        storedEventId: storedEvent.id,
      });

      return NextResponse.json({
        success: true,
        message: 'Webhook processed successfully',
        eventId: storedEvent.id,
      });

    } catch (processError) {
      // Mark event as failed and increment retry count
      await supabase
        .from('bling_webhook_events')
        .update({
          error_message: processError instanceof Error ? processError.message : 'Processing failed',
          retry_count: storedEvent.retry_count + 1,
        })
        .eq('id', storedEvent.id);

      logSecure('Bling webhook processing failed', {
        topic: validatedParams.topic,
        companyId,
        eventId: event.data.id,
        storedEventId: storedEvent.id,
        error: processError instanceof Error ? processError.message : 'Unknown error',
      });

      return NextResponse.json({
        error: 'Webhook processing failed',
        message: processError instanceof Error ? processError.message : 'Unknown error',
        eventId: storedEvent.id,
      }, { status: 500 });
    }

  } catch (error) {
    logSecure('Bling webhook API error', {
      topic: params.topic,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json({
      error: 'Internal server error',
      message: 'Failed to process webhook',
    }, { status: 500 });
  }
}

// Helper function to identify company from webhook
async function identifyCompanyFromWebhook(
  event: any,
  signature: string,
  supabase: any
): Promise<string | null> {
  // TODO: Implement company identification logic
  // This could be based on:
  // 1. Company-specific webhook URLs
  // 2. Custom headers
  // 3. Event data matching
  // 4. Signature verification against all companies
  
  // For now, return null - needs implementation based on Bling webhook structure
  return null;
}

// Helper function to process webhook events
async function processWebhookEvent(
  topic: string,
  event: any,
  companyId: string,
  supabase: any
): Promise<void> {
  switch (topic) {
    case 'orders':
      await processOrderWebhook(event, companyId, supabase);
      break;
    case 'products':
      await processProductWebhook(event, companyId, supabase);
      break;
    case 'status':
      await processStatusWebhook(event, companyId, supabase);
      break;
    case 'stock':
      await processStockWebhook(event, companyId, supabase);
      break;
    default:
      throw new Error(`Unsupported webhook topic: ${topic}`);
  }
}

async function processOrderWebhook(event: any, companyId: string, supabase: any): Promise<void> {
  // TODO: Implement order webhook processing
  // This would trigger incremental sync for the specific order
}

async function processProductWebhook(event: any, companyId: string, supabase: any): Promise<void> {
  // TODO: Implement product webhook processing
  // This would trigger incremental sync for the specific product
}

async function processStatusWebhook(event: any, companyId: string, supabase: any): Promise<void> {
  // TODO: Implement status webhook processing
  // This would update order status in real-time
}

async function processStockWebhook(event: any, companyId: string, supabase: any): Promise<void> {
  // TODO: Implement stock webhook processing
  // This would update stock levels in real-time
}
