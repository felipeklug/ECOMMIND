/**
 * Shopee Webhook Handler API
 * POST /api/shopee/webhook/[topic]
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ShopeeWebhookEventSchema } from '@/core/validation/shopee.schemas';
import { ShopeeAdapter } from '@/core/adapters/shopee/ShopeeAdapter';
import { logSecure } from '@/lib/logger';
import { z } from 'zod';

const TopicParamsSchema = z.object({
  topic: z.enum(['order_status', 'item_update']),
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
    const signature = request.headers.get('x-shopee-signature') || '';

    // Parse webhook payload
    let webhookData;
    try {
      webhookData = JSON.parse(rawBody);
    } catch (parseError) {
      logSecure('Shopee webhook - invalid JSON', {
        topic: validatedParams.topic,
        error: parseError instanceof Error ? parseError.message : 'JSON parse error',
      });

      return NextResponse.json({
        error: 'Invalid JSON payload',
      }, { status: 400 });
    }

    // Validate webhook event structure
    const { data: event, error: eventError } = ShopeeWebhookEventSchema.safeParse(webhookData);
    if (eventError) {
      logSecure('Shopee webhook - invalid event structure', {
        topic: validatedParams.topic,
        error: eventError.errors,
      });

      return NextResponse.json({
        error: 'Invalid webhook event structure',
        details: eventError.errors,
      }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();

    // Find company by shop_id
    const { data: integration, error: integrationError } = await supabase
      .from('integrations_shopee')
      .select('company_id, webhook_enabled, webhook_secret')
      .eq('shop_id', event.shop_id.toString())
      .single();

    if (integrationError || !integration) {
      logSecure('Shopee webhook - integration not found', {
        topic: validatedParams.topic,
        shopId: event.shop_id,
        timestamp: event.timestamp,
      });

      return NextResponse.json({
        error: 'Integration not found',
        message: 'No integration found for this Shopee shop',
      }, { status: 404 });
    }

    if (!integration.webhook_enabled) {
      logSecure('Shopee webhook - webhooks disabled', {
        topic: validatedParams.topic,
        companyId: integration.company_id,
        shopId: event.shop_id,
      });

      return NextResponse.json({
        error: 'Webhooks disabled',
        message: 'Webhooks are disabled for this integration',
      }, { status: 400 });
    }

    // Verify webhook signature if secret is configured
    if (integration.webhook_secret && signature) {
      const adapter = new ShopeeAdapter({
        baseUrl: 'https://partner.shopeemobile.com',
        partnerId: process.env.SHOPEE_PARTNER_ID!,
        partnerKey: process.env.SHOPEE_PARTNER_KEY!,
        redirectUri: process.env.SHOPEE_REDIRECT_URI!,
        region: 'BR', // Default region for signature validation
      });

      const isValidSignature = adapter.validateWebhookSignature(
        rawBody,
        signature,
        integration.webhook_secret
      );

      if (!isValidSignature) {
        logSecure('Shopee webhook - invalid signature', {
          topic: validatedParams.topic,
          companyId: integration.company_id,
          shopId: event.shop_id,
        });

        return NextResponse.json({
          error: 'Invalid webhook signature',
        }, { status: 401 });
      }
    }

    // Determine event type and data based on topic and payload
    let eventType = validatedParams.topic;
    let dataType = '';
    let dataId = '';

    if (validatedParams.topic === 'order_status' && event.data.order_sn) {
      dataType = 'order';
      dataId = event.data.order_sn;
    } else if (validatedParams.topic === 'item_update' && event.data.item_id) {
      dataType = 'item';
      dataId = event.data.item_id.toString();
    }

    // Check for duplicate events
    const { data: existingEvent } = await supabase
      .from('shopee_webhook_events')
      .select('id')
      .eq('company_id', integration.company_id)
      .eq('shop_id', event.shop_id.toString())
      .eq('event_type', eventType)
      .eq('data_type', dataType)
      .eq('data_id', dataId)
      .eq('timestamp_shopee', event.timestamp)
      .single();

    if (existingEvent) {
      logSecure('Shopee webhook - duplicate event ignored', {
        topic: validatedParams.topic,
        companyId: integration.company_id,
        shopId: event.shop_id,
        dataType,
        dataId,
        existingEventId: existingEvent.id,
      });

      return NextResponse.json({
        message: 'Event already processed',
        eventId: existingEvent.id,
      });
    }

    // Store webhook event
    const { data: storedEvent, error: storeError } = await supabase
      .from('shopee_webhook_events')
      .insert({
        company_id: integration.company_id,
        shop_id: event.shop_id.toString(),
        event_type: eventType,
        data_type: dataType,
        data_id: dataId,
        timestamp_shopee: event.timestamp,
        payload: webhookData,
        signature,
        processed: false,
        retry_count: 0,
      })
      .select()
      .single();

    if (storeError) {
      logSecure('Shopee webhook - failed to store event', {
        topic: validatedParams.topic,
        companyId: integration.company_id,
        shopId: event.shop_id,
        error: storeError.message,
      });

      return NextResponse.json({
        error: 'Failed to store webhook event',
      }, { status: 500 });
    }

    // Process webhook event based on topic
    try {
      await processWebhookEvent(validatedParams.topic, event, integration.company_id, supabase);

      // Mark event as processed
      await supabase
        .from('shopee_webhook_events')
        .update({
          processed: true,
          processed_at: new Date().toISOString(),
        })
        .eq('id', storedEvent.id);

      logSecure('Shopee webhook processed successfully', {
        topic: validatedParams.topic,
        companyId: integration.company_id,
        shopId: event.shop_id,
        dataType,
        dataId,
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
        .from('shopee_webhook_events')
        .update({
          error_message: processError instanceof Error ? processError.message : 'Processing failed',
          retry_count: storedEvent.retry_count + 1,
        })
        .eq('id', storedEvent.id);

      logSecure('Shopee webhook processing failed', {
        topic: validatedParams.topic,
        companyId: integration.company_id,
        shopId: event.shop_id,
        dataType,
        dataId,
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
    logSecure('Shopee webhook API error', {
      topic: params.topic,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json({
      error: 'Internal server error',
      message: 'Failed to process webhook',
    }, { status: 500 });
  }
}

// Helper function to process webhook events
async function processWebhookEvent(
  topic: string,
  event: any,
  companyId: string,
  supabase: any
): Promise<void> {
  switch (topic) {
    case 'order_status':
      await processOrderStatusWebhook(event, companyId, supabase);
      break;
    case 'item_update':
      await processItemUpdateWebhook(event, companyId, supabase);
      break;
    default:
      throw new Error(`Unsupported webhook topic: ${topic}`);
  }
}

async function processOrderStatusWebhook(event: any, companyId: string, supabase: any): Promise<void> {
  // TODO: Implement order status webhook processing
  // This would trigger incremental sync for the specific order
  const orderSn = event.data.order_sn;
  const status = event.data.status;
  
  // Could trigger background job to sync this specific order
  logSecure('Processing order status webhook', {
    companyId,
    orderSn,
    status,
    shopId: event.shop_id,
  });
}

async function processItemUpdateWebhook(event: any, companyId: string, supabase: any): Promise<void> {
  // TODO: Implement item update webhook processing
  // This would trigger incremental sync for the specific item
  const itemId = event.data.item_id;
  const updateTime = event.data.update_time;
  
  // Could trigger background job to sync this specific item
  logSecure('Processing item update webhook', {
    companyId,
    itemId,
    updateTime,
    shopId: event.shop_id,
  });
}
