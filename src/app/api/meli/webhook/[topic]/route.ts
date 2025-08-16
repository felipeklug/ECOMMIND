/**
 * Mercado Livre Webhook Handler API
 * POST /api/meli/webhook/[topic]
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { MeliWebhookNotificationSchema } from '@/core/validation/meli.schemas';
import { logSecure } from '@/lib/logger';
import { z } from 'zod';

const TopicParamsSchema = z.object({
  topic: z.enum(['orders', 'items', 'questions', 'claims']),
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

    // Get raw body for webhook validation
    const rawBody = await request.text();

    // Parse webhook payload
    let webhookData;
    try {
      webhookData = JSON.parse(rawBody);
    } catch (parseError) {
      logSecure('Meli webhook - invalid JSON', {
        topic: validatedParams.topic,
        error: parseError instanceof Error ? parseError.message : 'JSON parse error',
      });

      return NextResponse.json({
        error: 'Invalid JSON payload',
      }, { status: 400 });
    }

    // Validate webhook notification structure
    const { data: notification, error: notificationError } = MeliWebhookNotificationSchema.safeParse(webhookData);
    if (notificationError) {
      logSecure('Meli webhook - invalid notification structure', {
        topic: validatedParams.topic,
        error: notificationError.errors,
      });

      return NextResponse.json({
        error: 'Invalid webhook notification structure',
        details: notificationError.errors,
      }, { status: 400 });
    }

    // Verify topic matches
    if (notification.topic !== validatedParams.topic) {
      logSecure('Meli webhook - topic mismatch', {
        urlTopic: validatedParams.topic,
        payloadTopic: notification.topic,
        resource: notification.resource,
      });

      return NextResponse.json({
        error: 'Topic mismatch',
        message: `URL topic '${validatedParams.topic}' does not match payload topic '${notification.topic}'`,
      }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();

    // Find company by user_id (Meli user ID)
    const { data: integration, error: integrationError } = await supabase
      .from('integrations_meli')
      .select('company_id, webhook_enabled, webhook_secret')
      .eq('user_id', notification.user_id.toString())
      .single();

    if (integrationError || !integration) {
      logSecure('Meli webhook - integration not found', {
        topic: validatedParams.topic,
        userId: notification.user_id,
        resource: notification.resource,
      });

      return NextResponse.json({
        error: 'Integration not found',
        message: 'No integration found for this Mercado Livre user',
      }, { status: 404 });
    }

    if (!integration.webhook_enabled) {
      logSecure('Meli webhook - webhooks disabled', {
        topic: validatedParams.topic,
        companyId: integration.company_id,
        userId: notification.user_id,
        resource: notification.resource,
      });

      return NextResponse.json({
        error: 'Webhooks disabled',
        message: 'Webhooks are disabled for this integration',
      }, { status: 400 });
    }

    // Check for duplicate events
    const { data: existingEvent } = await supabase
      .from('meli_webhook_events')
      .select('id')
      .eq('company_id', integration.company_id)
      .eq('topic', notification.topic)
      .eq('resource', notification.resource)
      .eq('user_id', notification.user_id.toString())
      .eq('application_id', notification.application_id.toString())
      .eq('sent', notification.sent)
      .single();

    if (existingEvent) {
      logSecure('Meli webhook - duplicate event ignored', {
        topic: validatedParams.topic,
        companyId: integration.company_id,
        resource: notification.resource,
        existingEventId: existingEvent.id,
      });

      return NextResponse.json({
        message: 'Event already processed',
        eventId: existingEvent.id,
      });
    }

    // Store webhook event
    const { data: storedEvent, error: storeError } = await supabase
      .from('meli_webhook_events')
      .insert({
        company_id: integration.company_id,
        topic: notification.topic,
        resource: notification.resource,
        user_id: notification.user_id.toString(),
        application_id: notification.application_id.toString(),
        attempts: notification.attempts,
        sent: notification.sent,
        received: notification.received,
        processed: false,
        retry_count: 0,
      })
      .select()
      .single();

    if (storeError) {
      logSecure('Meli webhook - failed to store event', {
        topic: validatedParams.topic,
        companyId: integration.company_id,
        resource: notification.resource,
        error: storeError.message,
      });

      return NextResponse.json({
        error: 'Failed to store webhook event',
      }, { status: 500 });
    }

    // Process webhook event based on topic
    try {
      await processWebhookEvent(validatedParams.topic, notification, integration.company_id, supabase);

      // Mark event as processed
      await supabase
        .from('meli_webhook_events')
        .update({
          processed: true,
          processed_at: new Date().toISOString(),
        })
        .eq('id', storedEvent.id);

      logSecure('Meli webhook processed successfully', {
        topic: validatedParams.topic,
        companyId: integration.company_id,
        resource: notification.resource,
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
        .from('meli_webhook_events')
        .update({
          error_message: processError instanceof Error ? processError.message : 'Processing failed',
          retry_count: storedEvent.retry_count + 1,
        })
        .eq('id', storedEvent.id);

      logSecure('Meli webhook processing failed', {
        topic: validatedParams.topic,
        companyId: integration.company_id,
        resource: notification.resource,
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
    logSecure('Meli webhook API error', {
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
  notification: any,
  companyId: string,
  supabase: any
): Promise<void> {
  switch (topic) {
    case 'orders':
      await processOrderWebhook(notification, companyId, supabase);
      break;
    case 'items':
      await processItemWebhook(notification, companyId, supabase);
      break;
    case 'questions':
      await processQuestionWebhook(notification, companyId, supabase);
      break;
    case 'claims':
      await processClaimWebhook(notification, companyId, supabase);
      break;
    default:
      throw new Error(`Unsupported webhook topic: ${topic}`);
  }
}

async function processOrderWebhook(notification: any, companyId: string, supabase: any): Promise<void> {
  // TODO: Implement order webhook processing
  // This would trigger incremental sync for the specific order
  // Extract order ID from resource: /orders/123456 -> 123456
  const orderId = notification.resource.split('/').pop();
  
  // Could trigger background job to sync this specific order
  logSecure('Processing order webhook', {
    companyId,
    orderId,
    resource: notification.resource,
  });
}

async function processItemWebhook(notification: any, companyId: string, supabase: any): Promise<void> {
  // TODO: Implement item webhook processing
  // This would trigger incremental sync for the specific item
  // Extract item ID from resource: /items/MLB123456 -> MLB123456
  const itemId = notification.resource.split('/').pop();
  
  // Could trigger background job to sync this specific item
  logSecure('Processing item webhook', {
    companyId,
    itemId,
    resource: notification.resource,
  });
}

async function processQuestionWebhook(notification: any, companyId: string, supabase: any): Promise<void> {
  // TODO: Implement question webhook processing
  // This would handle new questions from buyers
  const questionId = notification.resource.split('/').pop();
  
  logSecure('Processing question webhook', {
    companyId,
    questionId,
    resource: notification.resource,
  });
}

async function processClaimWebhook(notification: any, companyId: string, supabase: any): Promise<void> {
  // TODO: Implement claim webhook processing
  // This would handle claims and disputes
  const claimId = notification.resource.split('/').pop();
  
  logSecure('Processing claim webhook', {
    companyId,
    claimId,
    resource: notification.resource,
  });
}
