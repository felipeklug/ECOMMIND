/**
 * Logout Page - Página de logout
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import { logSecure } from '@/lib/logger';
import { Loader2 } from 'lucide-react';

export default function LogoutPage() {
  const router = useRouter();
  const supabase = createSupabaseClient();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Get current user for logging
        const { data: { user } } = await supabase.auth.getUser();
        
        // Sign out
        const { error } = await supabase.auth.signOut();

        if (error) {
          logSecure('Logout error', {
            error: error.message,
            userId: user?.id,
          });
        } else {
          logSecure('User logged out successfully', {
            userId: user?.id,
          });
        }

        // Redirect to home page
        router.push('/');
        
      } catch (error) {
        logSecure('Logout unexpected error', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        
        // Still redirect even if there's an error
        router.push('/');
      }
    };

    handleLogout();
  }, [router, supabase]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Fazendo logout...</p>
      </div>
    </div>
  );
}
