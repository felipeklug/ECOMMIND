/**
 * Revenue MTD Hook
 * Fetches month-to-date revenue data
 */

'use client';

import useSWR from 'swr';

interface RevenueMTDData {
  current: number;
  previous: number;
  changePercent: number;
  period: string;
}

const fetcher = async (url: string): Promise<RevenueMTDData> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch revenue data');
  }
  return response.json();
};

export function useKpiRevenueMTD() {
  const { data, error, isLoading, mutate } = useSWR<RevenueMTDData>(
    '/api/secure/dashboard/revenue-mtd',
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
