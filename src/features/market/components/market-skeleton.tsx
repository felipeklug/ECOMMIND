/**
 * Market Skeleton
 * Loading skeleton for market intelligence page
 */

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function MarketSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Controls Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Filters */}
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-32" />
          </div>
          
          {/* Search */}
          <Skeleton className="h-9 w-64" />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-8 w-8" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Insights Table Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 pb-2 border-b">
              <Skeleton className="h-4 w-16 col-span-2" />
              <Skeleton className="h-4 w-24 col-span-3" />
              <Skeleton className="h-4 w-16 col-span-2" />
              <Skeleton className="h-4 w-20 col-span-2" />
              <Skeleton className="h-4 w-16 col-span-2" />
              <Skeleton className="h-4 w-12 col-span-1" />
            </div>

            {/* Table Rows */}
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="grid grid-cols-12 gap-4 items-center py-3">
                <div className="col-span-2">
                  <Skeleton className="h-6 w-20" />
                </div>
                <div className="col-span-3">
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
                <div className="col-span-2">
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="col-span-2">
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                </div>
                <div className="col-span-2">
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="col-span-1">
                  <div className="flex items-center space-x-1">
                    <Skeleton className="h-6 w-6" />
                    <Skeleton className="h-6 w-6" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Skeleton className="h-4 w-32" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
