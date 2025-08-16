/**
 * ETL Feed Hook
 * Fetches recent ETL runs for activity feed
 */

'use client';

import useSWR from 'swr';

interface EtlRun {
  id: string;
  source: string;
  started_at: string;
  finished_at: string | null;
  ok: boolean;
  pages: number | null;
  rows: number | null;
  error: string | null;
  duration?: number;
}

const fetcher = async (url: string): Promise<EtlRun[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch ETL feed data');
  }
  return response.json();
};

export function useEtlFeed(limit: number = 10) {
  const { data, error, isLoading, mutate } = useSWR<EtlRun[]>(
    `/api/secure/dashboard/etl-feed?limit=${limit}`,
    fetcher,
    {
      refreshInterval: 30 * 1000, // 30 seconds
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
