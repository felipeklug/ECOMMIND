/**
 * Chat SLA Report API
 * Returns SLA metrics for chat support
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateApiAccess, logSecure } from '@/app/api/_helpers/auth';
import { createClient } from '@/lib/supabase/server';
import { createTimer } from '@/lib/logger';

const ChatSLAQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  agent: z.string().optional(),
  period: z.enum(['7d', '30d', '90d']).default('30d'),
});

export async function GET(request: NextRequest) {
  const timer = createTimer('reports_chat_sla');
  
  try {
    // Validate authentication
    const { context, error } = await validateApiAccess();
    if (error) return error;

    const { userId, companyId, isAuthenticated } = context;
    
    if (!isAuthenticated || !companyId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const params = ChatSLAQuerySchema.parse({
      from: searchParams.get('from'),
      to: searchParams.get('to'),
      agent: searchParams.get('agent'),
      period: searchParams.get('period') || '30d',
    });

    const supabase = createClient();

    // Calculate date range
    let fromDate: string;
    let toDate: string;

    if (params.from && params.to) {
      fromDate = params.from;
      toDate = params.to;
    } else {
      const now = new Date();
      toDate = now.toISOString().split('T')[0];
      
      const daysBack = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
      }[params.period];
      
      const fromDateTime = new Date(now);
      fromDateTime.setDate(fromDateTime.getDate() - daysBack);
      fromDate = fromDateTime.toISOString().split('T')[0];
    }

    // Build query
    let query = supabase
      .from('rpt_chat_sla_by_agent')
      .select('*')
      .eq('company_id', companyId)
      .gte('day', fromDate)
      .lte('day', toDate)
      .order('day', { ascending: false });

    if (params.agent) {
      query = query.eq('agent_id', params.agent);
    }

    const { data: slaData, error: slaError } = await query;

    if (slaError) {
      throw new Error(`Failed to fetch SLA data: ${slaError.message}`);
    }

    // Calculate aggregated metrics
    const totalThreads = slaData?.reduce((sum, row) => sum + (row.total_threads || 0), 0) || 0;
    const totalResponded = slaData?.reduce((sum, row) => sum + (row.responded_threads || 0), 0) || 0;
    const totalResolved = slaData?.reduce((sum, row) => sum + (row.resolved_threads || 0), 0) || 0;
    const totalBacklog = slaData?.reduce((sum, row) => sum + (row.backlog_threads || 0), 0) || 0;

    const avgFirstResponse = slaData?.length > 0 
      ? slaData.reduce((sum, row) => sum + (row.avg_first_response_minutes || 0), 0) / slaData.length 
      : 0;

    const avgResolution = slaData?.length > 0 
      ? slaData.reduce((sum, row) => sum + (row.avg_resolution_minutes || 0), 0) / slaData.length 
      : 0;

    const avgSatisfaction = slaData?.length > 0 
      ? slaData.reduce((sum, row) => sum + (row.avg_satisfaction || 0), 0) / slaData.length 
      : 0;

    // Calculate response rate
    const responseRate = totalThreads > 0 ? (totalResponded / totalThreads) * 100 : 0;
    const resolutionRate = totalThreads > 0 ? (totalResolved / totalThreads) * 100 : 0;

    // Group by agent for agent performance
    const agentPerformance = slaData?.reduce((acc, row) => {
      if (!row.agent_id) return acc;
      
      if (!acc[row.agent_id]) {
        acc[row.agent_id] = {
          agent_id: row.agent_id,
          agent_name: row.agent_name,
          total_threads: 0,
          responded_threads: 0,
          resolved_threads: 0,
          backlog_threads: 0,
          avg_first_response_minutes: 0,
          avg_resolution_minutes: 0,
          avg_satisfaction: 0,
          days_count: 0,
        };
      }
      
      const agent = acc[row.agent_id];
      agent.total_threads += row.total_threads || 0;
      agent.responded_threads += row.responded_threads || 0;
      agent.resolved_threads += row.resolved_threads || 0;
      agent.backlog_threads += row.backlog_threads || 0;
      agent.avg_first_response_minutes += row.avg_first_response_minutes || 0;
      agent.avg_resolution_minutes += row.avg_resolution_minutes || 0;
      agent.avg_satisfaction += row.avg_satisfaction || 0;
      agent.days_count += 1;
      
      return acc;
    }, {} as Record<string, any>) || {};

    // Calculate averages for agents
    Object.values(agentPerformance).forEach((agent: any) => {
      if (agent.days_count > 0) {
        agent.avg_first_response_minutes = agent.avg_first_response_minutes / agent.days_count;
        agent.avg_resolution_minutes = agent.avg_resolution_minutes / agent.days_count;
        agent.avg_satisfaction = agent.avg_satisfaction / agent.days_count;
        agent.response_rate = agent.total_threads > 0 ? (agent.responded_threads / agent.total_threads) * 100 : 0;
        agent.resolution_rate = agent.total_threads > 0 ? (agent.resolved_threads / agent.total_threads) * 100 : 0;
      }
    });

    const result = {
      period: {
        from: fromDate,
        to: toDate,
        days: slaData?.length || 0,
      },
      summary: {
        total_threads: totalThreads,
        responded_threads: totalResponded,
        resolved_threads: totalResolved,
        backlog_threads: totalBacklog,
        response_rate: Math.round(responseRate * 100) / 100,
        resolution_rate: Math.round(resolutionRate * 100) / 100,
        avg_first_response_minutes: Math.round(avgFirstResponse * 100) / 100,
        avg_resolution_minutes: Math.round(avgResolution * 100) / 100,
        avg_satisfaction: Math.round(avgSatisfaction * 100) / 100,
      },
      daily_data: slaData || [],
      agent_performance: Object.values(agentPerformance),
      insights: generateChatSLAInsights({
        responseRate,
        avgFirstResponse,
        avgResolution,
        totalBacklog,
        avgSatisfaction,
      }),
    };

    timer.end({ 
      companyId, 
      period: params.period,
      totalThreads,
      agentsCount: Object.keys(agentPerformance).length,
    });

    logSecure('info', 'Chat SLA report generated', {
      companyId,
      userId,
      period: params.period,
      totalThreads,
      responseRate: Math.round(responseRate),
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
    
    logSecure('error', 'Chat SLA report API failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Generate AI insights for chat SLA
 */
function generateChatSLAInsights(metrics: {
  responseRate: number;
  avgFirstResponse: number;
  avgResolution: number;
  totalBacklog: number;
  avgSatisfaction: number;
}) {
  const insights = [];

  // Response rate insights
  if (metrics.responseRate < 80) {
    insights.push({
      type: 'warning',
      title: 'Taxa de resposta baixa',
      description: `${Math.round(metrics.responseRate)}% dos chats recebem primeira resposta. Meta: 95%+`,
      recommendation: 'Redistribuir atendimento nos horários de pico (12-14h)',
      action: 'create_mission',
      priority: 'high',
    });
  }

  // First response time insights
  if (metrics.avgFirstResponse > 5) {
    insights.push({
      type: 'warning',
      title: 'Tempo de primeira resposta alto',
      description: `Média de ${Math.round(metrics.avgFirstResponse)} minutos. Meta: <3 min`,
      recommendation: 'Implementar respostas automáticas para dúvidas frequentes',
      action: 'create_mission',
      priority: 'medium',
    });
  }

  // Backlog insights
  if (metrics.totalBacklog > 10) {
    insights.push({
      type: 'critical',
      title: 'Backlog elevado',
      description: `${metrics.totalBacklog} conversas pendentes`,
      recommendation: 'Alocar recursos adicionais para reduzir fila',
      action: 'create_mission',
      priority: 'high',
    });
  }

  // Satisfaction insights
  if (metrics.avgSatisfaction < 4.0) {
    insights.push({
      type: 'warning',
      title: 'Satisfação abaixo da meta',
      description: `Nota média: ${metrics.avgSatisfaction.toFixed(1)}/5. Meta: 4.5+`,
      recommendation: 'Revisar qualidade do atendimento e treinamento da equipe',
      action: 'create_mission',
      priority: 'medium',
    });
  }

  // Positive insights
  if (metrics.responseRate >= 95 && metrics.avgFirstResponse <= 3) {
    insights.push({
      type: 'success',
      title: 'Excelente performance de SLA',
      description: `${Math.round(metrics.responseRate)}% de resposta em ${Math.round(metrics.avgFirstResponse)} min`,
      recommendation: 'Manter padrão atual e documentar melhores práticas',
      action: 'none',
      priority: 'low',
    });
  }

  return insights;
}
