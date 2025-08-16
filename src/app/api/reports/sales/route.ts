/**
 * Sales Report API
 * Returns sales metrics by channel and period
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateApiAccess, logSecure } from '@/app/api/_helpers/auth';
import { createClient } from '@/lib/supabase/server';
import { createTimer } from '@/lib/logger';

const SalesQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  channel: z.string().optional(),
  period: z.enum(['7d', '30d', '90d']).default('30d'),
});

export async function GET(request: NextRequest) {
  const timer = createTimer('reports_sales');
  
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
    const params = SalesQuerySchema.parse({
      from: searchParams.get('from'),
      to: searchParams.get('to'),
      channel: searchParams.get('channel'),
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
      .from('rpt_sales_by_channel')
      .select('*')
      .eq('company_id', companyId)
      .gte('day', fromDate)
      .lte('day', toDate)
      .order('day', { ascending: false });

    if (params.channel && params.channel !== 'all') {
      query = query.eq('channel', params.channel);
    }

    const { data: salesData, error: salesError } = await query;

    if (salesError) {
      throw new Error(`Failed to fetch sales data: ${salesError.message}`);
    }

    // Calculate aggregated metrics
    const totalOrders = salesData?.reduce((sum, row) => sum + (row.total_orders || 0), 0) || 0;
    const grossRevenue = salesData?.reduce((sum, row) => sum + (row.gross_revenue || 0), 0) || 0;
    const netRevenue = salesData?.reduce((sum, row) => sum + (row.net_revenue || 0), 0) || 0;
    const totalFees = salesData?.reduce((sum, row) => sum + (row.total_fees || 0), 0) || 0;
    const totalCogs = salesData?.reduce((sum, row) => sum + (row.total_cogs || 0), 0) || 0;
    const grossProfit = salesData?.reduce((sum, row) => sum + (row.gross_profit || 0), 0) || 0;

    const avgTicket = totalOrders > 0 ? grossRevenue / totalOrders : 0;
    const marginPercent = grossRevenue > 0 ? (grossProfit / grossRevenue) * 100 : 0;
    const feePercent = grossRevenue > 0 ? (totalFees / grossRevenue) * 100 : 0;

    // Group by channel for channel performance
    const channelPerformance = salesData?.reduce((acc, row) => {
      const channel = row.channel || 'unknown';
      
      if (!acc[channel]) {
        acc[channel] = {
          channel,
          total_orders: 0,
          gross_revenue: 0,
          net_revenue: 0,
          total_fees: 0,
          total_cogs: 0,
          gross_profit: 0,
          days_count: 0,
        };
      }
      
      const channelData = acc[channel];
      channelData.total_orders += row.total_orders || 0;
      channelData.gross_revenue += row.gross_revenue || 0;
      channelData.net_revenue += row.net_revenue || 0;
      channelData.total_fees += row.total_fees || 0;
      channelData.total_cogs += row.total_cogs || 0;
      channelData.gross_profit += row.gross_profit || 0;
      channelData.days_count += 1;
      
      return acc;
    }, {} as Record<string, any>) || {};

    // Calculate derived metrics for channels
    Object.values(channelPerformance).forEach((channel: any) => {
      channel.avg_ticket = channel.total_orders > 0 ? channel.gross_revenue / channel.total_orders : 0;
      channel.margin_percent = channel.gross_revenue > 0 ? (channel.gross_profit / channel.gross_revenue) * 100 : 0;
      channel.fee_percent = channel.gross_revenue > 0 ? (channel.total_fees / channel.gross_revenue) * 100 : 0;
      channel.daily_avg_orders = channel.days_count > 0 ? channel.total_orders / channel.days_count : 0;
      channel.daily_avg_revenue = channel.days_count > 0 ? channel.gross_revenue / channel.days_count : 0;
    });

    // Calculate previous period for comparison
    const periodDays = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
    }[params.period];

    const prevFromDate = new Date(fromDate);
    prevFromDate.setDate(prevFromDate.getDate() - periodDays);
    const prevToDate = new Date(toDate);
    prevToDate.setDate(prevToDate.getDate() - periodDays);

    let prevQuery = supabase
      .from('rpt_sales_by_channel')
      .select('gross_revenue, total_orders, gross_profit')
      .eq('company_id', companyId)
      .gte('day', prevFromDate.toISOString().split('T')[0])
      .lte('day', prevToDate.toISOString().split('T')[0]);

    if (params.channel && params.channel !== 'all') {
      prevQuery = prevQuery.eq('channel', params.channel);
    }

    const { data: prevSalesData } = await prevQuery;

    const prevGrossRevenue = prevSalesData?.reduce((sum, row) => sum + (row.gross_revenue || 0), 0) || 0;
    const prevTotalOrders = prevSalesData?.reduce((sum, row) => sum + (row.total_orders || 0), 0) || 0;
    const prevGrossProfit = prevSalesData?.reduce((sum, row) => sum + (row.gross_profit || 0), 0) || 0;

    // Calculate growth rates
    const revenueGrowth = prevGrossRevenue > 0 ? ((grossRevenue - prevGrossRevenue) / prevGrossRevenue) * 100 : 0;
    const ordersGrowth = prevTotalOrders > 0 ? ((totalOrders - prevTotalOrders) / prevTotalOrders) * 100 : 0;
    const profitGrowth = prevGrossProfit > 0 ? ((grossProfit - prevGrossProfit) / prevGrossProfit) * 100 : 0;

    const result = {
      period: {
        from: fromDate,
        to: toDate,
        days: salesData?.length || 0,
      },
      summary: {
        total_orders: totalOrders,
        gross_revenue: Math.round(grossRevenue * 100) / 100,
        net_revenue: Math.round(netRevenue * 100) / 100,
        total_fees: Math.round(totalFees * 100) / 100,
        total_cogs: Math.round(totalCogs * 100) / 100,
        gross_profit: Math.round(grossProfit * 100) / 100,
        avg_ticket: Math.round(avgTicket * 100) / 100,
        margin_percent: Math.round(marginPercent * 100) / 100,
        fee_percent: Math.round(feePercent * 100) / 100,
        revenue_growth: Math.round(revenueGrowth * 100) / 100,
        orders_growth: Math.round(ordersGrowth * 100) / 100,
        profit_growth: Math.round(profitGrowth * 100) / 100,
      },
      daily_data: salesData || [],
      channel_performance: Object.values(channelPerformance),
      insights: generateSalesInsights({
        marginPercent,
        revenueGrowth,
        ordersGrowth,
        avgTicket,
        feePercent,
        channelPerformance: Object.values(channelPerformance),
      }),
    };

    timer.end({ 
      companyId, 
      period: params.period,
      totalOrders,
      grossRevenue: Math.round(grossRevenue),
      channelsCount: Object.keys(channelPerformance).length,
    });

    logSecure('info', 'Sales report generated', {
      companyId,
      userId,
      period: params.period,
      totalOrders,
      grossRevenue: Math.round(grossRevenue),
      marginPercent: Math.round(marginPercent),
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
    
    logSecure('error', 'Sales report API failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Generate AI insights for sales
 */
function generateSalesInsights(metrics: {
  marginPercent: number;
  revenueGrowth: number;
  ordersGrowth: number;
  avgTicket: number;
  feePercent: number;
  channelPerformance: any[];
}) {
  const insights = [];

  // Margin insights
  if (metrics.marginPercent < 20) {
    insights.push({
      type: 'warning',
      title: 'Margem abaixo da meta',
      description: `Margem atual: ${metrics.marginPercent.toFixed(1)}%. Meta: 25%+`,
      recommendation: 'Revisar preços e negociar melhores condições com fornecedores',
      action: 'create_mission',
      priority: 'high',
    });
  }

  // Growth insights
  if (metrics.revenueGrowth < -10) {
    insights.push({
      type: 'critical',
      title: 'Queda significativa na receita',
      description: `Receita caiu ${Math.abs(metrics.revenueGrowth).toFixed(1)}% vs período anterior`,
      recommendation: 'Investigar causas e implementar ações de recuperação',
      action: 'create_mission',
      priority: 'high',
    });
  } else if (metrics.revenueGrowth > 20) {
    insights.push({
      type: 'success',
      title: 'Crescimento acelerado',
      description: `Receita cresceu ${metrics.revenueGrowth.toFixed(1)}% vs período anterior`,
      recommendation: 'Garantir estoque e capacidade para sustentar crescimento',
      action: 'create_mission',
      priority: 'medium',
    });
  }

  // Fee insights
  if (metrics.feePercent > 15) {
    insights.push({
      type: 'warning',
      title: 'Taxas elevadas',
      description: `${metrics.feePercent.toFixed(1)}% da receita em taxas e fretes`,
      recommendation: 'Otimizar mix de canais e negociar fretes',
      action: 'create_mission',
      priority: 'medium',
    });
  }

  // Channel performance insights
  const bestChannel = metrics.channelPerformance.reduce((best, channel) => 
    channel.margin_percent > (best?.margin_percent || 0) ? channel : best, null);

  const worstChannel = metrics.channelPerformance.reduce((worst, channel) => 
    channel.margin_percent < (worst?.margin_percent || 100) ? channel : worst, null);

  if (bestChannel && worstChannel && bestChannel.channel !== worstChannel.channel) {
    const marginDiff = bestChannel.margin_percent - worstChannel.margin_percent;
    if (marginDiff > 10) {
      insights.push({
        type: 'info',
        title: 'Oportunidade de otimização de mix',
        description: `${bestChannel.channel} tem ${marginDiff.toFixed(1)}p.p. mais margem que ${worstChannel.channel}`,
        recommendation: `Priorizar vendas no ${bestChannel.channel} e revisar estratégia no ${worstChannel.channel}`,
        action: 'create_mission',
        priority: 'medium',
      });
    }
  }

  return insights;
}
