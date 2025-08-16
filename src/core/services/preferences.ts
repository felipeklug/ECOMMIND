/**
 * Preferences Service
 * Handles user preferences and company settings persistence
 */

import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import type { 
  CompanySettings, 
  UserPreferences, 
  CompleteOnboardingPayload 
} from '@/features/onboarding/schemas';

export interface PreferencesService {
  getUserPreferences(userId: string): Promise<UserPreferences | null>;
  updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void>;
  getCompanySettings(companyId: string): Promise<CompanySettings | null>;
  updateCompanySettings(companyId: string, settings: Partial<CompanySettings>): Promise<void>;
  saveOnboardingProgress(userId: string, step: number, data: any): Promise<void>;
  completeOnboarding(userId: string, companyId: string, payload: CompleteOnboardingPayload): Promise<void>;
}

class PreferencesServiceImpl implements PreferencesService {
  private supabase = createClient();

  /**
   * Get user preferences from profiles.settings
   */
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('settings')
        .eq('id', userId)
        .single();

      if (error) {
        logger.error('Failed to get user preferences', { userId, error: error.message });
        return null;
      }

      // Return default preferences if none exist
      if (!data?.settings) {
        return {
          v: 1,
          theme: 'light',
        };
      }

      return data.settings as UserPreferences;
    } catch (error) {
      logger.error('Error getting user preferences', { userId, error });
      return null;
    }
  }

  /**
   * Update user preferences in profiles.settings
   */
  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void> {
    try {
      // Get current preferences
      const current = await this.getUserPreferences(userId);
      
      // Merge with new preferences
      const updated: UserPreferences = {
        ...current,
        ...preferences,
        v: 1, // Ensure version is set
      };

      const { error } = await this.supabase
        .from('profiles')
        .update({ 
          settings: updated,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        throw new Error(`Failed to update user preferences: ${error.message}`);
      }

      logger.info('User preferences updated', { userId });
    } catch (error) {
      logger.error('Error updating user preferences', { userId, error });
      throw error;
    }
  }

  /**
   * Get company settings from companies.settings
   */
  async getCompanySettings(companyId: string): Promise<CompanySettings | null> {
    try {
      const { data, error } = await this.supabase
        .from('companies')
        .select('settings')
        .eq('id', companyId)
        .single();

      if (error) {
        logger.error('Failed to get company settings', { companyId, error: error.message });
        return null;
      }

      // Return default settings if none exist
      if (!data?.settings) {
        return {
          v: 1,
          fiscal: { isSimples: true, aliquota: 12 },
          marginTargets: { meli: 15, shopee: 12, amazon: 14, site: 18 },
          abc: { A: 0.8, B: 0.15, C: 0.05 },
          coverageDays: { meli_full: 28, shopee_full: 21, amazon_fba: 28, site_full: 14 },
          marketScope: 'niche',
          onboardingCompleted: false,
        };
      }

      return data.settings as CompanySettings;
    } catch (error) {
      logger.error('Error getting company settings', { companyId, error });
      return null;
    }
  }

  /**
   * Update company settings in companies.settings
   */
  async updateCompanySettings(companyId: string, settings: Partial<CompanySettings>): Promise<void> {
    try {
      // Get current settings
      const current = await this.getCompanySettings(companyId);
      
      // Merge with new settings
      const updated: CompanySettings = {
        ...current,
        ...settings,
        v: 1, // Ensure version is set
      };

      const { error } = await this.supabase
        .from('companies')
        .update({ 
          settings: updated,
          updated_at: new Date().toISOString(),
        })
        .eq('id', companyId);

      if (error) {
        throw new Error(`Failed to update company settings: ${error.message}`);
      }

      logger.info('Company settings updated', { companyId });
    } catch (error) {
      logger.error('Error updating company settings', { companyId, error });
      throw error;
    }
  }

  /**
   * Save onboarding progress to user preferences
   */
  async saveOnboardingProgress(userId: string, step: number, data: any): Promise<void> {
    try {
      const preferences = await this.getUserPreferences(userId);
      
      const updatedPreferences: UserPreferences = {
        ...preferences,
        onboardingStep: step,
        onboardingData: {
          ...preferences?.onboardingData,
          [step === 1 ? 'connections' : step === 2 ? 'preferences' : 'review']: data,
        },
      };

      await this.updateUserPreferences(userId, updatedPreferences);
      
      logger.info('Onboarding progress saved', { userId, step });
    } catch (error) {
      logger.error('Error saving onboarding progress', { userId, step, error });
      throw error;
    }
  }

  /**
   * Complete onboarding process
   */
  async completeOnboarding(
    userId: string, 
    companyId: string, 
    payload: CompleteOnboardingPayload
  ): Promise<void> {
    try {
      // Update company settings
      const companySettings: CompanySettings = {
        v: 1,
        fiscal: payload.preferences.fiscal,
        marginTargets: payload.preferences.marginTargets,
        abc: payload.preferences.abcCurve,
        coverageDays: payload.preferences.coverageDays,
        marketScope: payload.preferences.marketScope,
        criticalSkuMargin: payload.preferences.criticalSkuMargin,
        onboardingCompleted: true,
        onboardingCompletedAt: new Date().toISOString(),
      };

      await this.updateCompanySettings(companyId, companySettings);

      // Clear onboarding data from user preferences
      const userPreferences = await this.getUserPreferences(userId);
      const updatedUserPreferences: UserPreferences = {
        ...userPreferences,
        onboardingStep: undefined,
        onboardingData: undefined,
      };

      await this.updateUserPreferences(userId, updatedUserPreferences);

      logger.info('Onboarding completed', { userId, companyId });
    } catch (error) {
      logger.error('Error completing onboarding', { userId, companyId, error });
      throw error;
    }
  }

  /**
   * Check if user has completed onboarding
   */
  async hasCompletedOnboarding(companyId: string): Promise<boolean> {
    try {
      const settings = await this.getCompanySettings(companyId);
      return settings?.onboardingCompleted || false;
    } catch (error) {
      logger.error('Error checking onboarding status', { companyId, error });
      return false;
    }
  }

  /**
   * Get onboarding progress for user
   */
  async getOnboardingProgress(userId: string): Promise<{
    step: number;
    data: any;
  } | null> {
    try {
      const preferences = await this.getUserPreferences(userId);
      
      if (!preferences?.onboardingStep || !preferences?.onboardingData) {
        return null;
      }

      return {
        step: preferences.onboardingStep,
        data: preferences.onboardingData,
      };
    } catch (error) {
      logger.error('Error getting onboarding progress', { userId, error });
      return null;
    }
  }
}

// Export singleton instance
export const preferencesService = new PreferencesServiceImpl();
