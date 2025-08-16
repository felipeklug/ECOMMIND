/**
 * Calendar Page
 * E-commerce calendar with events and seasonal dates
 */

import { Suspense } from 'react';
import { Metadata } from 'next/types';
import { CalendarContent } from '@/features/market/components/calendar-content';
import { CalendarSkeleton } from '@/features/market/components/calendar-skeleton';

export const metadata: Metadata = {
  title: 'Calendário | ECOMMIND',
  description: 'Calendário de e-commerce com eventos sazonais e datas especiais',
};

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendário de E-commerce</h1>
          <p className="text-muted-foreground">
            Eventos sazonais, datas especiais e oportunidades de mercado
          </p>
        </div>
      </div>

      {/* Calendar Content */}
      <Suspense fallback={<CalendarSkeleton />}>
        <CalendarContent />
      </Suspense>
    </div>
  );
}
