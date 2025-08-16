/**
 * Products Count Hook
 * Fetches products count and sync data
 */

'use client';

import useSWR from 'swr';

interface ProductsCountData {
  total: number;
  active: number;
  recentlyAdded: number;
  lastSync: string | null;
}

const fetcher = async (url: string): Promise<ProductsCountData> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch products data');
  }
  return response.json();
};

export function useKpiProductsCount() {
  const { data, error, isLoading, mutate } = useSWR<ProductsCountData>(
    '/api/secure/dashboard/products-count',
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
