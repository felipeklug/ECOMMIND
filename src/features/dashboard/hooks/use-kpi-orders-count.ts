/**
 * Orders Count Hook
 * Fetches orders count data
 */

'use client';

import useSWR from 'swr';

interface OrdersCountData {
  currentMonth: number;
  previousMonth: number;
  changePercent: number;
  totalHistoric: number;
}

const fetcher = async (url: string): Promise<OrdersCountData> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch orders data');
  }
  return response.json();
};

export function useKpiOrdersCount() {
  const { data, error, isLoading, mutate } = useSWR<OrdersCountData>(
    '/api/secure/dashboard/orders-count',
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
