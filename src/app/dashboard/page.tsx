/**
 * Dashboard Home Page
 * Main dashboard with widgets composition
 */

import { Suspense } from 'react';
import { Metadata } from 'next/types';
import { DashboardContent } from '@/features/dashboard/components/dashboard-content';
import { DashboardContentSkeleton } from '@/features/dashboard/components/dashboard-content-skeleton';

export const metadata: Metadata = {
  title: 'Dashboard | ECOMMIND',
  description: 'Visão geral dos seus KPIs e métricas de e-commerce',
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral dos seus KPIs e métricas de performance
          </p>
        </div>
      </div>

      {/* Dashboard Content */}
      <Suspense fallback={<DashboardContentSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}


