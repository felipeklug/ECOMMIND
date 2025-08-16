/**
 * Target Progress Top Hook
 * Fetches top 5 target progress data
 */

'use client';

import useSWR from 'swr';

interface TargetProgressItem {
  sku: string;
  channel: string;
  revenueProgress: number;
  unitsProgress: number;
  targetRevenue: number;
  actualRevenue: number;
  targetUnits: number;
  actualUnits: number;
  period: string;
}

const fetcher = async (url: string): Promise<TargetProgressItem[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch target progress data');
  }
  return response.json();
};

export function useTargetProgressTop(limit: number = 5) {
  const { data, error, isLoading, mutate } = useSWR<TargetProgressItem[]>(
    `/api/secure/dashboard/target-progress-top?limit=${limit}`,
    fetcher,
    {
      refreshInterval: 10 * 60 * 1000, // 10 minutes
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
