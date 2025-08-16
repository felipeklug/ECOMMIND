/**
 * Missions Open Hook
 * Fetches open missions count data
 */

'use client';

import useSWR from 'swr';

interface MissionsOpenData {
  open: number;
  total: number;
  priority: {
    P0: number;
    P1: number;
    P2: number;
  };
  byStatus: {
    backlog: number;
    planned: number;
    in_progress: number;
  };
}

const fetcher = async (url: string): Promise<MissionsOpenData> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch missions data');
  }
  return response.json();
};

export function useKpiMissionsOpen() {
  const { data, error, isLoading, mutate } = useSWR<MissionsOpenData>(
    '/api/secure/dashboard/missions-open',
    fetcher,
    {
      refreshInterval: 2 * 60 * 1000, // 2 minutes
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
