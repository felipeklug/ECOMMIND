/**
 * Onboarding Validation Schemas
 * Zod schemas for type-safe onboarding data validation
 */

import { z } from 'zod';

// ERP Provider options
export const erpProviderSchema = z.enum(['bling', 'tiny']);
export type ERPProvider = z.infer<typeof erpProviderSchema>;

// Sales Channel options
export const salesChannelSchema = z.enum(['meli', 'shopee', 'amazon', 'site']);
export type SalesChannel = z.infer<typeof salesChannelSchema>;

// Connection status
export const connectionStatusSchema = z.enum(['connected', 'pending', 'error']);
export type ConnectionStatus = z.infer<typeof connectionStatusSchema>;

// Step 1: Connections Schema
export const connectionsStepSchema = z.object({
  erp: erpProviderSchema,
  channels: z.array(salesChannelSchema).min(1, 'Selecione pelo menos um canal de venda'),
  connectionStatuses: z.record(z.string(), connectionStatusSchema).optional(),
});

export type ConnectionsStep = z.infer<typeof connectionsStepSchema>;

// Fiscal regime schema
export const fiscalRegimeSchema = z.object({
  isSimples: z.boolean(),
  aliquota: z.number().min(0).max(100).optional(),
  regime: z.string().optional(),
});

// Margin targets by channel
export const marginTargetsSchema = z.object({
  meli: z.number().min(0).max(100).default(15),
  shopee: z.number().min(0).max(100).default(12),
  amazon: z.number().min(0).max(100).default(14),
  site: z.number().min(0).max(100).default(18),
});

// ABC curve limits
export const abcCurveSchema = z.object({
  A: z.number().min(0).max(1).default(0.8),
  B: z.number().min(0).max(1).default(0.15),
  C: z.number().min(0).max(1).default(0.05),
});

// Coverage days by channel
export const coverageDaysSchema = z.object({
  meli_full: z.number().min(1).max(365).default(28),
  shopee_full: z.number().min(1).max(365).default(21),
  amazon_fba: z.number().min(1).max(365).default(28),
  site_full: z.number().min(1).max(365).default(14),
});

// Market intelligence scope
export const marketScopeSchema = z.enum(['niche', 'category']);
export type MarketScope = z.infer<typeof marketScopeSchema>;

// Step 2: Preferences Schema
export const preferencesStepSchema = z.object({
  fiscal: fiscalRegimeSchema,
  marginTargets: marginTargetsSchema,
  abcCurve: abcCurveSchema,
  coverageDays: coverageDaysSchema,
  marketScope: marketScopeSchema,
  criticalSkuMargin: z.number().min(0).max(100).optional(),
});

export type PreferencesStep = z.infer<typeof preferencesStepSchema>;

// Step 3: Review Schema
export const reviewStepSchema = z.object({
  enableBackfill: z.boolean().default(true),
  createSeedMissions: z.boolean().default(true),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Você deve aceitar os termos para continuar',
  }),
});

export type ReviewStep = z.infer<typeof reviewStepSchema>;

// Complete onboarding payload
export const completeOnboardingSchema = z.object({
  connections: connectionsStepSchema,
  preferences: preferencesStepSchema,
  review: reviewStepSchema,
  version: z.number().default(1),
});

export type CompleteOnboardingPayload = z.infer<typeof completeOnboardingSchema>;

// Company settings structure (for database storage)
export const companySettingsSchema = z.object({
  v: z.number().default(1),
  fiscal: fiscalRegimeSchema,
  marginTargets: marginTargetsSchema,
  abc: abcCurveSchema,
  coverageDays: coverageDaysSchema,
  marketScope: marketScopeSchema,
  criticalSkuMargin: z.number().optional(),
  onboardingCompleted: z.boolean().default(false),
  onboardingCompletedAt: z.string().optional(),
});

export type CompanySettings = z.infer<typeof companySettingsSchema>;

// User preferences structure (for profiles.prefs)
export const userPreferencesSchema = z.object({
  v: z.number().default(1),
  theme: z.enum(['light', 'dark']).default('light'),
  flags: z.record(z.string(), z.boolean()).optional(),
  onboardingStep: z.number().min(1).max(3).optional(),
  onboardingData: z.object({
    connections: connectionsStepSchema.optional(),
    preferences: preferencesStepSchema.optional(),
    review: reviewStepSchema.optional(),
  }).optional(),
});

export type UserPreferences = z.infer<typeof userPreferencesSchema>;

// Integration status for UI
export const integrationStatusSchema = z.object({
  provider: z.string(),
  status: connectionStatusSchema,
  connectedAt: z.string().optional(),
  lastSync: z.string().optional(),
  error: z.string().optional(),
});

export type IntegrationStatus = z.infer<typeof integrationStatusSchema>;

// Default values for forms
export const defaultConnections: ConnectionsStep = {
  erp: 'bling',
  channels: ['meli'],
};

export const defaultPreferences: PreferencesStep = {
  fiscal: {
    isSimples: true,
    aliquota: 12,
  },
  marginTargets: {
    meli: 15,
    shopee: 12,
    amazon: 14,
    site: 18,
  },
  abcCurve: {
    A: 0.8,
    B: 0.15,
    C: 0.05,
  },
  coverageDays: {
    meli_full: 28,
    shopee_full: 21,
    amazon_fba: 28,
    site_full: 14,
  },
  marketScope: 'niche',
};

export const defaultReview: ReviewStep = {
  enableBackfill: true,
  createSeedMissions: true,
  acceptTerms: false,
};

// Validation helpers
export function validateStep(step: number, data: any): { success: boolean; errors?: any } {
  try {
    switch (step) {
      case 1:
        connectionsStepSchema.parse(data);
        break;
      case 2:
        preferencesStepSchema.parse(data);
        break;
      case 3:
        reviewStepSchema.parse(data);
        break;
      default:
        return { success: false, errors: { step: 'Invalid step number' } };
    }
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.flatten().fieldErrors };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
}

// Provider display names
export const providerDisplayNames = {
  bling: 'Bling ERP',
  tiny: 'Tiny ERP',
  meli: 'Mercado Livre',
  shopee: 'Shopee',
  amazon: 'Amazon',
  site: 'Site Próprio',
} as const;

// Channel colors for UI
export const channelColors = {
  meli: 'bg-yellow-500',
  shopee: 'bg-orange-500',
  amazon: 'bg-gray-900',
  site: 'bg-blue-500',
} as const;
