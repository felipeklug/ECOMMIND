/**
 * Sales by Day Hook
 * Fetches daily sales data for charts
 */

'use client';

import useSWR from 'swr';

interface SalesByDayData {
  date: string;
  total: number;
  orders: number;
  channels: {
    meli: number;
    shopee: number;
    amazon: number;
    site: number;
  };
}

const fetcher = async (url: string): Promise<SalesByDayData[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch sales by day data');
  }
  return response.json();
};

export function useSalesByDay(period?: string) {
  const { data, error, isLoading, mutate } = useSWR<SalesByDayData[]>(
    `/api/secure/dashboard/sales-by-day${period ? `?period=${period}` : ''}`,
    fetcher,
    {
      refreshInterval: 5 * 60 * 1000, // 5 minutes
      revalidateOnFocus: true,
      fallbackData: undefined,
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
