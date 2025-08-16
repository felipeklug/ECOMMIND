/**
 * Lead API - Captura de leads do site
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';
import { logSecure } from '@/lib/logger';
import { z } from 'zod';

// Schema de validação Zod
const LeadSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
  email: z.string().email('Email inválido').max(255, 'Email muito longo'),
  phone: z.string().optional().refine(
    (phone) => !phone || /^[\d\s\-\(\)\+]{10,20}$/.test(phone),
    'Telefone inválido'
  ),
  company: z.string().optional().max(100, 'Nome da empresa muito longo'),
  interest: z.array(z.enum([
    'bi',
    'chat360',
    'automacao',
    'integracao',
    'consultoria',
    'outro'
  ])).min(1, 'Selecione pelo menos um interesse'),
  message: z.string().optional().max(1000, 'Mensagem muito longa'),
  utm: z.object({
    source: z.string().optional(),
    medium: z.string().optional(),
    campaign: z.string().optional(),
    term: z.string().optional(),
    content: z.string().optional(),
  }).optional(),
  // Honeypot para detectar bots
  website: z.string().optional().refine(
    (website) => !website || website === '',
    'Campo website deve estar vazio'
  ),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 10 requests por minuto por IP
    const rateLimitResult = await rateLimit({
      key: `lead:${request.ip || 'unknown'}`,
      limit: 10,
      window: 60000, // 1 minuto
    });

    if (!rateLimitResult.success) {
      logSecure('Lead API rate limited', {
        ip: request.ip,
        remaining: rateLimitResult.remaining,
      });

      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          message: 'Muitas tentativas. Tente novamente em alguns minutos.',
        },
        { status: 429 }
      );
    }

    // Parse e validação do body
    const body = await request.json();
    const validatedData = LeadSchema.parse(body);

    // Verificar honeypot
    if (validatedData.website) {
      logSecure('Lead API honeypot triggered', {
        ip: request.ip,
        honeypot: validatedData.website,
      });

      // Retornar sucesso para não alertar bots
      return NextResponse.json({ success: true });
    }

    // Sanitizar dados
    const sanitizedData = {
      name: validatedData.name.trim(),
      email: validatedData.email.toLowerCase().trim(),
      phone: validatedData.phone?.trim() || null,
      company: validatedData.company?.trim() || null,
      interest: validatedData.interest,
      message: validatedData.message?.trim() || null,
      utm: validatedData.utm || {},
    };

    // Salvar no banco
    const supabase = createSupabaseServerClient();
    
    const { data: lead, error: insertError } = await supabase
      .from('leads')
      .insert({
        name: sanitizedData.name,
        email: sanitizedData.email,
        phone: sanitizedData.phone,
        company: sanitizedData.company,
        interest: sanitizedData.interest,
        message: sanitizedData.message,
        utm: sanitizedData.utm,
        ip_address: request.ip || null,
        user_agent: request.headers.get('user-agent') || null,
        referer: request.headers.get('referer') || null,
      })
      .select()
      .single();

    if (insertError) {
      // Verificar se é duplicata de email
      if (insertError.code === '23505') {
        logSecure('Lead API duplicate email', {
          email: sanitizedData.email,
          ip: request.ip,
        });

        return NextResponse.json(
          {
            error: 'Duplicate email',
            message: 'Este email já está cadastrado. Nossa equipe entrará em contato em breve.',
          },
          { status: 409 }
        );
      }

      logSecure('Lead API database error', {
        error: insertError.message,
        code: insertError.code,
        ip: request.ip,
      });

      return NextResponse.json(
        {
          error: 'Database error',
          message: 'Erro interno. Tente novamente ou entre em contato conosco.',
        },
        { status: 500 }
      );
    }

    // Log de sucesso (sem PII)
    logSecure('Lead created successfully', {
      leadId: lead.id,
      interests: sanitizedData.interest,
      hasCompany: !!sanitizedData.company,
      hasPhone: !!sanitizedData.phone,
      hasMessage: !!sanitizedData.message,
      utmSource: sanitizedData.utm.source,
      ip: request.ip,
    });

    // TODO: Enviar para sistema de email marketing
    // TODO: Notificar equipe de vendas
    // TODO: Disparar evento para Event Bus

    return NextResponse.json({
      success: true,
      message: 'Lead cadastrado com sucesso! Nossa equipe entrará em contato em breve.',
      leadId: lead.id,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      logSecure('Lead API validation error', {
        errors: error.errors,
        ip: request.ip,
      });

      return NextResponse.json(
        {
          error: 'Validation error',
          message: 'Dados inválidos. Verifique os campos e tente novamente.',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    logSecure('Lead API unexpected error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: request.ip,
    });

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Erro interno. Tente novamente ou entre em contato conosco.',
      },
      { status: 500 }
    );
  }
}

// Método OPTIONS para CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
