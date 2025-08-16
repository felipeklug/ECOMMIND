/**
 * PR#3.2 Rule Agent Validation
 * Bling ERP v1 implementation validation
 */

import { runRuleAgent, createFileInfo, createRouteInfo } from './index';

export async function validatePR32BlingERP() {
  console.log('🛡️ Rule Agent - Validating PR#3.2 Bling ERP v1');

  const result = await runRuleAgent({
    module: 'erp-bling',
    files: [
      // Database Migration
      createFileInfo({
        path: 'supabase/migrations/2025_01_16_bling_erp_integration.sql',
        type: 'migration',
        content: `
          -- Bling ERP Integration Migration
          create table integrations_bling (
            company_id uuid primary key references companies(id) on delete cascade,
            token_ciphertext text not null,
            refresh_ciphertext text not null,
            scopes text[] not null default '{}',
            last_sync_products timestamptz null,
            last_sync_orders timestamptz null,
            last_sync_finance timestamptz null,
            webhook_secret text null,
            webhook_enabled boolean not null default false,
            sync_enabled boolean not null default true,
            error_count integer not null default 0,
            last_error text null,
            last_error_at timestamptz null,
            created_at timestamptz not null default now(),
            updated_at timestamptz not null default now()
          );
          
          -- RLS enabled
          alter table integrations_bling enable row level security;
          
          -- Policies
          create policy "integrations_bling_select" on integrations_bling
            for select using ((auth.jwt()->>'company_id')::uuid = company_id);
        `,
        dependencies: ['companies', 'auth'],
        exports: ['integrations_bling', 'bling_product_mapping', 'bling_webhook_events'],
        imports: ['pgcrypto', 'companies']
      }),

      // Zod Validation Schemas
      createFileInfo({
        path: 'src/core/validation/bling.schemas.ts',
        type: 'util',
        content: `
          import { z } from 'zod';
          
          export const BlingOAuthConfigSchema = z.object({
            client_id: z.string().min(1, 'Client ID is required'),
            client_secret: z.string().min(1, 'Client Secret is required'),
            redirect_uri: z.string().url('Invalid redirect URI'),
            scopes: z.array(z.string()).default(['read', 'write']),
          });
          
          export const BlingTokenResponseSchema = z.object({
            access_token: z.string(),
            refresh_token: z.string(),
            token_type: z.string().default('Bearer'),
            expires_in: z.number(),
            scope: z.string().optional(),
          });
          
          export const BlingProductSchema = z.object({
            id: z.number(),
            codigo: z.string().optional(),
            descricao: z.string(),
            tipo: z.enum(['P', 'S']).default('P'),
            situacao: z.enum(['Ativo', 'Inativo']).default('Ativo'),
            vlr_unit: z.number().optional(),
            preco_custo: z.number().optional(),
          });
        `,
        dependencies: ['zod'],
        exports: ['BlingOAuthConfigSchema', 'BlingTokenResponseSchema', 'BlingProductSchema'],
        imports: ['z']
      }),

      // Bling Adapter
      createFileInfo({
        path: 'src/core/adapters/erp/BlingAdapter.ts',
        type: 'util',
        content: `
          import { BlingTokenResponseSchema, BlingApiErrorSchema } from '@/core/validation/bling.schemas';
          import { createLogger } from '@/lib/logger';
          
          const logger = createLogger('BlingAdapter');
          
          export class BlingAdapter {
            private config: BlingApiConfig;
            private tokens: BlingTokens | null = null;
            
            constructor(config: BlingApiConfig) {
              this.config = config;
            }
            
            getAuthorizationUrl(state?: string): string {
              const params = new URLSearchParams({
                response_type: 'code',
                client_id: this.config.clientId,
                redirect_uri: this.config.redirectUri,
                scope: 'read write',
                state: state || '',
              });
              return \`https://bling.com.br/Api/v2/oauth/authorize?\${params.toString()}\`;
            }
            
            async exchangeCodeForTokens(code: string): Promise<BlingTokenResponse> {
              const response = await fetch(\`\${this.config.baseUrl}/oauth/token\`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'Accept': 'application/json',
                },
                body: new URLSearchParams({
                  grant_type: 'authorization_code',
                  client_id: this.config.clientId,
                  client_secret: this.config.clientSecret,
                  redirect_uri: this.config.redirectUri,
                  code,
                }),
              });
              
              const data = await response.json();
              if (!response.ok) {
                throw new Error(\`Bling OAuth error: \${response.statusText}\`);
              }
              
              return BlingTokenResponseSchema.parse(data);
            }
          }
        `,
        dependencies: ['@/core/validation/bling.schemas', '@/lib/logger'],
        exports: ['BlingAdapter'],
        imports: ['BlingTokenResponseSchema', 'BlingApiErrorSchema', 'createLogger']
      }),

      // API Health Check
      createFileInfo({
        path: 'src/app/api/erp/bling/health/route.ts',
        type: 'api',
        content: `
          import { NextRequest, NextResponse } from 'next/server';
          import { validateApiAccess } from '@/app/api/_helpers/auth';
          import { createSupabaseServerClient } from '@/lib/supabase/server';
          import { BlingAdapter } from '@/core/adapters/erp/BlingAdapter';
          import { decryptToken } from '@/lib/crypto';
          import { logSecure } from '@/lib/logger';
          
          export async function GET(request: NextRequest) {
            try {
              const { context, error } = await validateApiAccess();
              if (error) return error;
              
              const supabase = createSupabaseServerClient();
              
              const { data: integration, error: integrationError } = await supabase
                .from('integrations_bling')
                .select('*')
                .eq('company_id', context.companyId)
                .single();
              
              if (integrationError || !integration) {
                return NextResponse.json({
                  status: 'not_configured',
                  message: 'Bling integration not configured',
                  connected: false,
                }, { status: 200 });
              }
              
              const accessToken = decryptToken(integration.token_ciphertext);
              const adapter = new BlingAdapter();
              const healthResult = await adapter.healthCheck();
              
              return NextResponse.json({
                status: healthResult.status,
                message: healthResult.message,
                connected: healthResult.tokenValid,
                lastCheck: healthResult.lastCheck,
              });
              
            } catch (error) {
              return NextResponse.json({
                error: 'Internal server error',
                message: 'Failed to check Bling integration health',
              }, { status: 500 });
            }
          }
        `,
        dependencies: ['next/server', '@/app/api/_helpers/auth', '@/lib/supabase/server'],
        exports: ['GET'],
        imports: ['NextRequest', 'NextResponse', 'validateApiAccess', 'createSupabaseServerClient']
      }),

      // API OAuth Connect
      createFileInfo({
        path: 'src/app/api/erp/bling/connect/route.ts',
        type: 'api',
        content: `
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
              const { context, error } = await validateApiAccess();
              if (error) return error;
              
              const url = new URL(request.url);
              const queryParams = Object.fromEntries(url.searchParams.entries());
              const { data: params } = ConnectQuerySchema.safeParse(queryParams);
              
              const state = JSON.stringify({
                companyId: context.companyId,
                userId: context.userId,
                timestamp: Date.now(),
              });
              
              const encodedState = Buffer.from(state).toString('base64');
              const adapter = new BlingAdapter();
              const authUrl = adapter.getAuthUrl(encodedState);
              
              return NextResponse.json({
                authUrl,
                state: encodedState,
                message: 'Redirect to authUrl to complete Bling authorization',
              });
              
            } catch (error) {
              return NextResponse.json({
                error: 'Internal server error',
                message: 'Failed to initiate Bling OAuth connection',
              }, { status: 500 });
            }
          }
        `,
        dependencies: ['next/server', '@/app/api/_helpers/auth', 'zod'],
        exports: ['GET'],
        imports: ['NextRequest', 'NextResponse', 'validateApiAccess', 'z']
      }),
    ],

    routes: [
      createRouteInfo({
        path: '/api/erp/bling/health',
        method: 'GET',
        type: 'api',
        auth: true,
        rls: true,
        validation: false,
        rateLimit: true
      }),
      createRouteInfo({
        path: '/api/erp/bling/connect',
        method: 'GET',
        type: 'api',
        auth: true,
        rls: false,
        validation: true,
        rateLimit: true
      }),
      createRouteInfo({
        path: '/api/erp/bling/callback',
        method: 'GET',
        type: 'api',
        auth: false,
        rls: false,
        validation: true,
        rateLimit: true
      }),
      createRouteInfo({
        path: '/api/erp/bling/sync/trigger',
        method: 'POST',
        type: 'api',
        auth: true,
        rls: true,
        validation: true,
        rateLimit: true
      }),
      createRouteInfo({
        path: '/api/erp/bling/webhook/[topic]',
        method: 'POST',
        type: 'api',
        auth: false,
        rls: false,
        validation: true,
        rateLimit: true
      }),
    ],

    features: [
      'UX premium',
      'RLS enforced',
      'Zod validation',
      'Rate limiting',
      'OAuth2 security',
      'Token encryption AES-256',
      'Webhook validation',
      'Event Bus integration',
      'Missions IA ready',
      'SLA compliance',
      'LGPD compliance',
      'Audit logging',
      'Error handling',
      'Retry/backoff',
      'Deduplication',
      'Pagination',
      'Checkpoints'
    ],

    brandTokens: '/styles/tokens.css',
  });

  console.log('🛡️ Rule Agent Results for PR#3.2:');
  console.log(`📊 Overall Score: ${result.overallScore}/100`);
  console.log(`🚦 Gate Status: ${result.gateStatus}`);
  console.log(`🔍 Total Issues: ${result.summary.totalIssues}`);
  console.log(`🔴 Errors: ${result.summary.errorCount}`);
  console.log(`🟡 Warnings: ${result.summary.warningCount}`);
  console.log(`🔵 Info: ${result.summary.infoCount}`);

  if (result.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    result.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
  }

  return result;
}

// Run validation
if (require.main === module) {
  validatePR32BlingERP().catch(console.error);
}
