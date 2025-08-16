/**
 * Market Intelligence Page
 * Market analysis, insights and opportunities
 */

import { Suspense } from 'react';
import { Metadata } from 'next/types';
import { MarketContent } from '@/features/market/components/market-content';
import { MarketSkeleton } from '@/features/market/components/market-skeleton';

export const metadata: Metadata = {
  title: 'Market Intelligence | ECOMMIND',
  description: 'Análise de mercado, insights e oportunidades de negócio',
};

export default function MarketPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Market Intelligence</h1>
          <p className="text-muted-foreground">
            Análise de mercado, tendências e oportunidades de produto
          </p>
        </div>
      </div>

      {/* Market Content */}
      <Suspense fallback={<MarketSkeleton />}>
        <MarketContent />
      </Suspense>
    </div>
  );
}
