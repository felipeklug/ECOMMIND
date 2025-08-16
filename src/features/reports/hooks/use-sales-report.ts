/**
 * Sales Report Hook
 * SWR hook for fetching sales report data
 */

import useSWR from 'swr';

interface UseSalesReportParams {
  period?: string;
  from?: string;
  to?: string;
  channel?: string;
}

interface SalesReportData {
  period: {
    from: string;
    to: string;
    days: number;
  };
  summary: {
    total_orders: number;
    gross_revenue: number;
    net_revenue: number;
    total_fees: number;
    total_cogs: number;
    gross_profit: number;
    avg_ticket: number;
    margin_percent: number;
    fee_percent: number;
    revenue_growth: number;
    orders_growth: number;
    profit_growth: number;
  };
  daily_data: Array<{
    day: string;
    channel: string;
    total_orders: number;
    gross_revenue: number;
    net_revenue: number;
    margin_percent: number;
  }>;
  channel_performance: Array<{
    channel: string;
    total_orders: number;
    gross_revenue: number;
    net_revenue: number;
    total_fees: number;
    gross_profit: number;
    avg_ticket: number;
    margin_percent: number;
    fee_percent: number;
    daily_avg_orders: number;
    daily_avg_revenue: number;
  }>;
  insights: Array<{
    type: 'success' | 'warning' | 'critical' | 'info';
    title: string;
    description: string;
    recommendation: string;
    action: 'create_mission' | 'none';
    priority: 'low' | 'medium' | 'high';
  }>;
}

const fetcher = async (url: string): Promise<SalesReportData> => {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
};

export function useSalesReport(params: UseSalesReportParams = {}) {
  // Build query string
  const searchParams = new URLSearchParams();
  
  if (params.period) searchParams.set('period', params.period);
  if (params.from) searchParams.set('from', params.from);
  if (params.to) searchParams.set('to', params.to);
  if (params.channel && params.channel !== 'all') searchParams.set('channel', params.channel);

  const queryString = searchParams.toString();
  const url = `/api/reports/sales${queryString ? `?${queryString}` : ''}`;

  const { data, error, mutate, isLoading } = useSWR<SalesReportData>(
    url,
    fetcher,
    {
      refreshInterval: 5 * 60 * 1000, // 5 minutes
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

// Hook for multiple sales reports comparison
export function useSalesReportComparison(
  currentParams: UseSalesReportParams,
  previousParams: UseSalesReportParams
) {
  const current = useSalesReport(currentParams);
  const previous = useSalesReport(previousParams);

  const comparison = {
    isLoading: current.isLoading || previous.isLoading,
    error: current.error || previous.error,
    data: current.data && previous.data ? {
      current: current.data,
      previous: previous.data,
      growth: {
        revenue: previous.data.summary.gross_revenue > 0 
          ? ((current.data.summary.gross_revenue - previous.data.summary.gross_revenue) / previous.data.summary.gross_revenue) * 100
          : 0,
        orders: previous.data.summary.total_orders > 0
          ? ((current.data.summary.total_orders - previous.data.summary.total_orders) / previous.data.summary.total_orders) * 100
          : 0,
        margin: current.data.summary.margin_percent - previous.data.summary.margin_percent,
        avg_ticket: previous.data.summary.avg_ticket > 0
          ? ((current.data.summary.avg_ticket - previous.data.summary.avg_ticket) / previous.data.summary.avg_ticket) * 100
          : 0,
      }
    } : null,
    mutate: () => {
      current.mutate();
      previous.mutate();
    }
  };

  return comparison;
}

// Hook for real-time sales metrics (for dashboard cards)
export function useSalesMetrics() {
  const { data, error, isLoading, mutate } = useSWR<{
    today: {
      revenue: number;
      orders: number;
      avg_ticket: number;
    };
    yesterday: {
      revenue: number;
      orders: number;
      avg_ticket: number;
    };
    growth: {
      revenue: number;
      orders: number;
      avg_ticket: number;
    };
  }>(
    '/api/reports/sales/metrics',
    fetcher,
    {
      refreshInterval: 2 * 60 * 1000, // 2 minutes for real-time feel
      revalidateOnFocus: true,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

// Hook for sales export
export function useExportSalesReport() {
  const exportReport = async (params: {
    format: 'pdf' | 'csv';
    period?: string;
    from?: string;
    to?: string;
    channel?: string;
  }) => {
    const searchParams = new URLSearchParams();
    
    searchParams.set('type', 'sales');
    searchParams.set('format', params.format);
    if (params.period) searchParams.set('period', params.period);
    if (params.from) searchParams.set('from', params.from);
    if (params.to) searchParams.set('to', params.to);
    if (params.channel && params.channel !== 'all') searchParams.set('channel', params.channel);

    const response = await fetch(`/api/reports/export?${searchParams.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filters: {
          period: params.period,
          from: params.from,
          to: params.to,
          channel: params.channel,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    // Handle file download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${new Date().toISOString().split('T')[0]}.${params.format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return { exportReport };
}
