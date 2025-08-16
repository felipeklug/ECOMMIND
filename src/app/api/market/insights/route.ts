/**
 * Market Insights Generation API
 * Generates insights from market dataset
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateApiAccess, logSecure } from '@/app/api/_helpers/auth';
import { createClient } from '@/lib/supabase/server';
import { createTimer } from '@/lib/logger';
import { MarketIntelEngine, type CompanyContext, type MarketRecord } from '@/core/rules/market-intel-engine';

const GenerateInsightsSchema = z.object({
  dataset_id: z.string().uuid(),
  auto_create_missions: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  const timer = createTimer('market_insights_generation');
  
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
    const { dataset_id, auto_create_missions } = GenerateInsightsSchema.parse(body);

    const supabase = createClient();

    // Verify dataset belongs to company
    const { data: dataset, error: datasetError } = await supabase
      .from('market_datasets')
      .select('*')
      .eq('id', dataset_id)
      .eq('company_id', companyId)
      .single();

    if (datasetError || !dataset) {
      return NextResponse.json(
        { error: 'Dataset not found or access denied' },
        { status: 404 }
      );
    }

    // Get market records for this dataset
    const { data: records, error: recordsError } = await supabase
      .from('market_records')
      .select('*')
      .eq('dataset_id', dataset_id)
      .eq('company_id', companyId);

    if (recordsError) {
      throw new Error(`Failed to fetch market records: ${recordsError.message}`);
    }

    if (!records || records.length === 0) {
      return NextResponse.json(
        { error: 'No records found in dataset' },
        { status: 400 }
      );
    }

    // Get company context
    const companyContext = await getCompanyContext(companyId);

    // Generate insights using the engine
    const engine = new MarketIntelEngine(companyId, companyContext, records as MarketRecord[]);
    const insights = await engine.generateInsights();

    // Save insights to database with dedupe
    const savedInsights = [];
    const duplicatedInsights = [];

    for (const insight of insights) {
      // Check for existing insight with same dedupe_key
      const { data: existingInsight } = await supabase
        .from('insights')
        .select('id')
        .eq('company_id', companyId)
        .eq('dedupe_key', insight.dedupe_key)
        .single();

      if (existingInsight) {
        duplicatedInsights.push({
          dedupe_key: insight.dedupe_key,
          type: insight.type,
          title: insight.title,
        });
        continue;
      }

      // Save new insight
      const { data: savedInsight, error: insightError } = await supabase
        .from('insights')
        .insert({
          company_id: companyId,
          agent: insight.agent,
          module: insight.module,
          type: insight.type,
          title: insight.title,
          summary: insight.summary,
          evidence: insight.evidence,
          scope: insight.scope,
          confidence: insight.confidence,
          impact: insight.impact,
          impact_estimate: insight.impact_estimate,
          dedupe_key: insight.dedupe_key,
          created_by: userId,
        })
        .select()
        .single();

      if (insightError) {
        logSecure('error', 'Failed to save insight', {
          companyId,
          dedupeKey: insight.dedupe_key,
          error: insightError.message,
        });
        continue;
      }

      savedInsights.push(savedInsight);

      // Create mission if requested and insight supports it
      if (auto_create_missions && insight.create_mission) {
        try {
          await createMissionFromInsight(savedInsight, insight, companyId, userId);
        } catch (missionError) {
          logSecure('error', 'Failed to create mission from insight', {
            companyId,
            insightId: savedInsight.id,
            error: missionError instanceof Error ? missionError.message : 'Unknown error',
          });
        }
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
        total_records: records.length,
        insights_generated: insights.length,
        insights_saved: savedInsights.length,
        insights_duplicated: duplicatedInsights.length,
        missions_created: auto_create_missions ? savedInsights.filter(i => i.type !== 'price_gap').length : 0,
      },
      insights: savedInsights.map(insight => ({
        id: insight.id,
        type: insight.type,
        title: insight.title,
        summary: insight.summary,
        confidence: insight.confidence,
        impact: insight.impact,
      })),
      duplicated: duplicatedInsights,
    };

    timer.end({ 
      companyId, 
      datasetId: dataset_id,
      recordsProcessed: records.length,
      insightsGenerated: insights.length,
      insightsSaved: savedInsights.length,
    });

    logSecure('info', 'Market insights generated successfully', {
      companyId,
      userId,
      datasetId: dataset_id,
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
    
    logSecure('error', 'Market insights API failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get company context for insights generation
 */
async function getCompanyContext(companyId: string): Promise<CompanyContext> {
  const supabase = createClient();

  // Get company settings
  const { data: company } = await supabase
    .from('companies')
    .select('settings')
    .eq('id', companyId)
    .single();

  // Get products
  const { data: products } = await supabase
    .from('products')
    .select('sku, title, category, price')
    .eq('company_id', companyId)
    .eq('active', true);

  // Default settings
  const settings = company?.settings || {};
  const defaultCommissions = {
    meli: 0.12,
    shopee: 0.08,
    amazon: 0.15,
    site: 0.03,
  };
  const defaultMargins = {
    default: 0.25,
  };

  return {
    id: companyId,
    focusCategories: settings.focus_categories || [],
    activeChannels: settings.active_channels || ['meli', 'shopee', 'amazon', 'site'],
    products: products || [],
    settings: {
      commissions: { ...defaultCommissions, ...settings.commissions },
      margins: { ...defaultMargins, ...settings.margins },
    },
  };
}

/**
 * Create mission from insight
 */
async function createMissionFromInsight(
  savedInsight: any, 
  insight: any, 
  companyId: string, 
  userId: string
) {
  const supabase = createClient();

  const missionTitle = generateMissionTitle(insight);
  const missionSummary = generateMissionSummary(insight);
  const tags = generateMissionTags(insight);

  const { error: missionError } = await supabase
    .from('missions')
    .insert({
      company_id: companyId,
      module: 'market',
      title: missionTitle,
      summary: missionSummary,
      status: 'backlog',
      priority: insight.priority,
      severity: insight.priority,
      tags,
      payload: {
        insight_id: savedInsight.id,
        insight_type: insight.type,
        scope: insight.scope,
        evidence: insight.evidence,
      },
      due_date: calculateDueDate(insight.sla_days),
      created_by: userId,
    });

  if (missionError) {
    throw new Error(`Failed to create mission: ${missionError.message}`);
  }
}

function generateMissionTitle(insight: any): string {
  const titles = {
    trend_opportunity: `Investigar tendência: ${insight.scope.identifier}`,
    gap_portfolio: `Avaliar adição ao portfólio: ${insight.scope.identifier}`,
    price_gap: `Revisar preço: ${insight.scope.sku || insight.scope.identifier}`,
    variation_opportunity: `Criar variações: ${insight.scope.sku}`,
    bundle_opportunity: `Desenvolver kit: ${insight.scope.identifier}`,
  };

  return titles[insight.type] || `Ação de mercado: ${insight.scope.identifier}`;
}

function generateMissionSummary(insight: any): string {
  return `${insight.summary}\n\nGerado automaticamente a partir de análise de mercado.`;
}

function generateMissionTags(insight: any): string[] {
  const tags = [
    `market:${insight.type}`,
    `channel:${insight.scope.channel}`,
  ];

  if (insight.scope.category) {
    tags.push(`category:${insight.scope.category.toLowerCase().replace(/\s+/g, '_')}`);
  }

  if (insight.scope.sku) {
    tags.push(`sku:${insight.scope.sku}`);
  }

  return tags;
}

function calculateDueDate(slaDays: number): string {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + slaDays);
  return dueDate.toISOString().split('T')[0];
}
