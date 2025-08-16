/**
 * Onboarding Page
 * Main onboarding wizard page with authentication protection
 */

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { Metadata } from 'next/types';
import { getSessionContext } from '@/app/api/_helpers/auth';
import { preferencesService } from '@/core/services/preferences';
import { OnboardingWizard } from '@/features/onboarding/ui/onboarding-wizard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Configuração Inicial | ECOMMIND',
  description: 'Configure seu ECOMMIND em poucos passos simples',
  robots: 'noindex, nofollow', // Don't index onboarding pages
};

async function OnboardingContent() {
  // Get user session and validate authentication
  const context = await getSessionContext();

  if (!context.isAuthenticated || !context.userId || !context.companyId) {
    redirect('/login?redirectTo=/onboarding');
  }

  // Check if onboarding was already completed
  const hasCompleted = await preferencesService.hasCompletedOnboarding(context.companyId);
  if (hasCompleted) {
    redirect('/dashboard');
  }

  // Get any saved onboarding progress
  const progress = await preferencesService.getOnboardingProgress(context.userId);

  const handleComplete = () => {
    // This will be handled by the client component
    // Redirect will happen after successful API call
  };

  return (
    <OnboardingWizard
      initialData={progress ? {
        step: progress.step,
        connections: progress.data.connections,
        preferences: progress.data.preferences,
        review: progress.data.review,
      } : undefined}
      onComplete={handleComplete}
    />
  );
}

function OnboardingLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>

          {/* Progress Skeleton */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>

          {/* Steps Navigation Skeleton */}
          <div className="flex items-center justify-center mt-8 space-x-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center space-x-3 p-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Card Skeleton */}
        <Card className="max-w-4xl mx-auto border-0 shadow-xl">
          <CardHeader className="text-center pb-6">
            <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
            <Skeleton className="h-8 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </CardHeader>

          <CardContent>
            <div className="space-y-6">
              {/* Content Skeleton */}
              <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map((item) => (
                    <div key={item} className="p-6 border rounded-xl">
                      <div className="flex items-start space-x-4">
                        <Skeleton className="w-12 h-12 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-full" />
                          <div className="space-y-1">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-3 w-28" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Skeleton */}
              <div className="flex items-center justify-between pt-6 border-t">
                <Skeleton className="h-10 w-32" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-20" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<OnboardingLoading />}>
      <OnboardingContent />
    </Suspense>
  );
}
