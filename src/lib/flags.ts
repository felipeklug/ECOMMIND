/**
 * Feature Flags System for ECOMMIND
 * Controls module availability and feature rollouts
 */

export type ModuleFlag = 
  | 'bi_v2'
  | 'planning_v1'
  | 'ads_v1'
  | 'ops_v1'
  | 'market_v1'
  | 'chat360_v1'
  | 'missions_v1';

export type Flags = Record<ModuleFlag, boolean>;

/**
 * Default flags from environment variables
 * Uses NEXT_PUBLIC_FLAG_* pattern for client-side access
 */
export function defaultFlagsFromEnv(): Flags {
  return {
    bi_v2: process.env.NEXT_PUBLIC_FLAG_BI_V2 === 'on',
    planning_v1: process.env.NEXT_PUBLIC_FLAG_PLANNING_V1 !== 'off', // default on
    ads_v1: process.env.NEXT_PUBLIC_FLAG_ADS_V1 === 'on',
    ops_v1: process.env.NEXT_PUBLIC_FLAG_OPS_V1 === 'on',
    market_v1: process.env.NEXT_PUBLIC_FLAG_MARKET_V1 === 'on',
    chat360_v1: process.env.NEXT_PUBLIC_FLAG_CHAT360_V1 === 'on',
    missions_v1: process.env.NEXT_PUBLIC_FLAG_MISSIONS_V1 !== 'off', // default on
  };
}

/**
 * Resolve final flags combining environment defaults with user overrides
 * User flags from profiles.prefs.flags take precedence
 */
export function resolveFlags(userFlags?: Partial<Flags>): Flags {
  const base = defaultFlagsFromEnv();
  return { ...base, ...userFlags };
}

/**
 * Check if a specific module is enabled
 */
export function isModuleEnabled(module: ModuleFlag, userFlags?: Partial<Flags>): boolean {
  const flags = resolveFlags(userFlags);
  return flags[module];
}

/**
 * Get module route mapping for middleware
 */
export const MODULE_ROUTES: Record<string, ModuleFlag> = {
  '/dashboard/bi': 'bi_v2',
  '/dashboard/planning': 'planning_v1',
  '/dashboard/ads': 'ads_v1',
  '/dashboard/ops': 'ops_v1',
  '/dashboard/market': 'market_v1',
  '/dashboard/chat': 'chat360_v1',
  '/dashboard/missions': 'missions_v1',
} as const;

/**
 * Get module name from route path
 */
export function getModuleFromPath(path: string): ModuleFlag | null {
  for (const [route, module] of Object.entries(MODULE_ROUTES)) {
    if (path.startsWith(route)) {
      return module;
    }
  }
  return null;
}

/**
 * Get human-readable module name for UI
 */
export function getModuleDisplayName(module: ModuleFlag): string {
  const names: Record<ModuleFlag, string> = {
    bi_v2: 'Business Intelligence',
    planning_v1: 'Planejamento',
    ads_v1: 'Gestão de Anúncios',
    ops_v1: 'Operações',
    market_v1: 'Marketplace',
    chat360_v1: 'Chat 360°',
    missions_v1: 'Missões IA',
  };
  return names[module];
}

/**
 * Development helper to log current flag state
 */
export function logFlagState(): void {
  if (process.env.NODE_ENV === 'development') {
    const flags = defaultFlagsFromEnv();
    console.table(flags);
  }
}
