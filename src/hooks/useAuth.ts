/**
 * useAuth Hook - Hook para autenticação
 */

'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createSupabaseClient } from '@/lib/supabase/client';
import { Role } from '@/core/rbac/roles';

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: Role;
  company_id: string | null;
  onboarding_completed: boolean;
  prefs: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
  });

  const supabase = createSupabaseClient();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          setState(prev => ({ ...prev, error: error.message, loading: false }));
          return;
        }

        if (session?.user) {
          await loadUserProfile(session.user);
        } else {
          setState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Unknown error',
          loading: false 
        }));
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            profile: null,
            loading: false,
            error: null,
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  const loadUserProfile = async (user: User) => {
    try {
      setState(prev => ({ ...prev, user, loading: true, error: null }));

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
              avatar_url: user.user_metadata?.avatar_url || null,
              role: 'viewer' as Role,
              onboarding_completed: false,
              prefs: {},
            })
            .select()
            .single();

          if (createError) {
            throw createError;
          }

          setState(prev => ({ 
            ...prev, 
            profile: newProfile as Profile, 
            loading: false 
          }));
        } else {
          throw error;
        }
      } else {
        setState(prev => ({ 
          ...prev, 
          profile: profile as Profile, 
          loading: false 
        }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load profile',
        loading: false 
      }));
    }
  };

  const signOut = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      setState({
        user: null,
        profile: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to sign out',
        loading: false 
      }));
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!state.user) {
      throw new Error('No user logged in');
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', state.user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setState(prev => ({ 
        ...prev, 
        profile: data as Profile 
      }));

      return data as Profile;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to update profile');
    }
  };

  const updatePreferences = async (prefs: Record<string, any>) => {
    if (!state.profile) {
      throw new Error('No profile loaded');
    }

    const updatedPrefs = { ...state.profile.prefs, ...prefs };
    return updateProfile({ prefs: updatedPrefs });
  };

  return {
    ...state,
    signOut,
    updateProfile,
    updatePreferences,
    isAuthenticated: !!state.user,
    isOnboardingComplete: state.profile?.onboarding_completed || false,
    hasCompany: !!state.profile?.company_id,
  };
}
