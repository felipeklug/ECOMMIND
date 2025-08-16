/**
 * Dashboard Layout
 * Premium layout with Header + UltraPremiumSidebar + Theme support
 */

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { Metadata } from 'next/types';
import { getSessionContext } from '@/app/api/_helpers/auth';
import { DashboardHeader } from '@/features/dashboard/components/dashboard-header';
import { UltraPremiumSidebar } from '@/features/dashboard/components/ultra-premium-sidebar';
import { DashboardSkeleton } from '@/features/dashboard/components/dashboard-skeleton';
import { ThemeProvider } from '@/features/dashboard/components/theme-provider';

export const metadata: Metadata = {
  title: 'Dashboard | ECOMMIND',
  description: 'Painel de controle inteligente para seu e-commerce',
};

async function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get user session and validate authentication
  const context = await getSessionContext();

  if (!context.isAuthenticated || !context.userId || !context.companyId) {
    redirect('/login?redirectTo=/dashboard');
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        {/* Fixed Sidebar */}
        <UltraPremiumSidebar />
        
        {/* Main Content Area */}
        <div className="lg:pl-72">
          {/* Fixed Header */}
          <DashboardHeader />
          
          {/* Page Content */}
          <main className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}
