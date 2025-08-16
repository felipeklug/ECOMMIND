/**
 * Dashboard Content
 * Main dashboard content with widgets composition
 */

'use client';

import { Suspense } from 'react';
import { KpiCards } from '@/features/dashboard/widgets/kpi-cards';
import { SalesByDayChart } from '@/features/dashboard/widgets/sales-by-day-chart';
import { TargetProgressTable } from '@/features/dashboard/widgets/target-progress-table';
import { EtlActivityFeed } from '@/features/dashboard/feed/etl-activity-feed';
import { KpiCardsSkeleton } from '@/features/dashboard/widgets/kpi-cards-skeleton';
import { ChartSkeleton } from '@/features/dashboard/widgets/chart-skeleton';
import { TableSkeleton } from '@/features/dashboard/widgets/table-skeleton';
import { FeedSkeleton } from '@/features/dashboard/feed/feed-skeleton';

export function DashboardContent() {
  return (
    <div className="space-y-8">
      {/* KPI Cards Row */}
      <section>
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Métricas Principais</h2>
          <p className="text-muted-foreground">
            Acompanhe os indicadores mais importantes do seu negócio
          </p>
        </div>
        
        <Suspense fallback={<KpiCardsSkeleton />}>
          <KpiCards />
        </Suspense>
      </section>

      {/* Charts and Tables Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Chart */}
        <div>
          <Suspense fallback={<ChartSkeleton />}>
            <SalesByDayChart />
          </Suspense>
        </div>

        {/* Target Progress Table */}
        <div>
          <Suspense fallback={<TableSkeleton />}>
            <TargetProgressTable />
          </Suspense>
        </div>
      </section>

      {/* Activity Feed */}
      <section>
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Atividades Recentes</h2>
          <p className="text-muted-foreground">
            Últimas execuções de ETL e sincronizações
          </p>
        </div>
        
        <Suspense fallback={<FeedSkeleton />}>
          <EtlActivityFeed />
        </Suspense>
      </section>
    </div>
  );
}
