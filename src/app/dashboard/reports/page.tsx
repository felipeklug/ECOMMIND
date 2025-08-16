/**
 * Reports Page
 * Main reports and analytics dashboard
 */

import { Metadata } from 'next';
import { ReportsDashboard } from '@/features/reports/components/reports-dashboard';

export const metadata: Metadata = {
  title: 'Relatórios & Analytics | ECOMMIND',
  description: 'Insights executivos e métricas de performance para seu e-commerce',
};

interface ReportsPageProps {
  searchParams: {
    tab?: string;
    period?: string;
    channel?: string;
    agent?: string;
  };
}

export default function ReportsPage({ searchParams }: ReportsPageProps) {
  const defaultTab = searchParams.tab || 'sales';

  return (
    <div className="container mx-auto py-6">
      <ReportsDashboard defaultTab={defaultTab} />
    </div>
  );
}
