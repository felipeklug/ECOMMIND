/**
 * Rule Agent - Export Index
 * Main exports for the governance system
 */

// Main Rule Agent class
export { RuleAgent } from './RuleAgent';

// Types and interfaces
export type {
  RuleContext,
  GeneratedFile,
  GeneratedRoute,
  CheckResult,
  Issue,
  RuleAgentResult,
  BrandTokens,
  UIKitComponent,
  AllowedDirectory,
  EventBusContract,
  EventDefinition,
  CheckConfig,
  RuleAgentConfig,
  BaseCheck,
  BaseReporter,
  FileAnalysis,
  SecurityAnalysis,
  A11yAnalysis
} from './types';

// Individual checks
export { BrandingCheck } from './checks/BrandingCheck';
export { ArchitectureCheck } from './checks/ArchitectureCheck';
export { IntegrationCheck } from './checks/IntegrationCheck';

// Reporters
export { ConsoleReporter } from './reporters/ConsoleReporter';
export { UINoticeReporter } from './reporters/UINoticeReporter';

// Utility functions for easy usage
export const createRuleContext = (options: {
  module: string;
  files?: any[];
  routes?: any[];
  features?: string[];
  brandTokens?: string;
}) => {
  return RuleAgent.createContext(options);
};

export const createFileInfo = (options: {
  path: string;
  type: 'component' | 'page' | 'api' | 'hook' | 'util' | 'style' | 'config' | 'migration';
  content?: string;
  dependencies?: string[];
  exports?: string[];
  imports?: string[];
}) => {
  return RuleAgent.createFileInfo(options);
};

export const createRouteInfo = (options: {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  type: 'api' | 'page';
  auth?: boolean;
  rls?: boolean;
  validation?: boolean;
  rateLimit?: boolean;
}) => {
  return RuleAgent.createRouteInfo(options);
};

// Quick run function for common usage
export const runRuleAgent = async (options: {
  module: string;
  files?: any[];
  routes?: any[];
  features?: string[];
  brandTokens?: string;
}) => {
  const context = createRuleContext(options);
  return await RuleAgent.run(context);
};

// Preset configurations for common scenarios
export const presetConfigs = {
  // Strict configuration for production
  strict: {
    checks: {
      branding: { enabled: true, severity: 'error' as const },
      architecture: { enabled: true, severity: 'error' as const },
      integration: { enabled: true, severity: 'error' as const }
    },
    gating: {
      enabled: true,
      failOnError: true,
      failOnWarningCount: 5
    }
  },
  
  // Relaxed configuration for development
  development: {
    checks: {
      branding: { enabled: true, severity: 'warning' as const },
      architecture: { enabled: true, severity: 'warning' as const },
      integration: { enabled: true, severity: 'info' as const }
    },
    gating: {
      enabled: false,
      failOnError: false,
      failOnWarningCount: 20
    }
  },
  
  // CI/CD configuration
  ci: {
    checks: {
      branding: { enabled: true, severity: 'error' as const },
      architecture: { enabled: true, severity: 'error' as const },
      integration: { enabled: true, severity: 'warning' as const }
    },
    reporters: ['console'],
    gating: {
      enabled: true,
      failOnError: true,
      failOnWarningCount: 10
    }
  }
};

// Helper function to apply preset configuration
export const applyPresetConfig = (preset: keyof typeof presetConfigs) => {
  const agent = RuleAgent.getInstance();
  const config = presetConfigs[preset];
  agent.updateConfig(config);
  return agent;
};

// Constants for common usage
export const RULE_AGENT_VERSION = '1.0.0';

export const SUPPORTED_FILE_TYPES = [
  'component',
  'page', 
  'api',
  'hook',
  'util',
  'style',
  'config',
  'migration'
] as const;

export const SUPPORTED_HTTP_METHODS = [
  'GET',
  'POST',
  'PUT',
  'DELETE',
  'PATCH'
] as const;

export const ISSUE_SEVERITIES = [
  'info',
  'warning',
  'error'
] as const;

export const GATE_STATUSES = [
  'pass',
  'warning',
  'fail'
] as const;

// Example usage documentation
export const USAGE_EXAMPLES = {
  basic: `
    import { runRuleAgent, createFileInfo, createRouteInfo } from '@/core/rules/rule-agent';
    
    const result = await runRuleAgent({
      module: 'chat-360',
      files: [
        createFileInfo({
          path: 'src/features/chat/components/ChatInterface.tsx',
          type: 'component',
          content: '...'
        })
      ],
      routes: [
        createRouteInfo({
          path: '/api/chat/messages',
          method: 'POST',
          type: 'api',
          auth: true,
          rls: true,
          validation: true
        })
      ],
      features: ['UX premium', 'RLS', 'SWR', 'Events', 'Missions', 'IA']
    });
    
    console.log('Gate Status:', result.gateStatus);
    console.log('Overall Score:', result.overallScore);
  `,
  
  advanced: `
    import { RuleAgent, applyPresetConfig } from '@/core/rules/rule-agent';
    
    // Apply strict configuration
    const agent = applyPresetConfig('strict');
    
    // Add custom check
    agent.addCheck('custom', new CustomCheck());
    
    // Run with custom context
    const context = RuleAgent.createContext({
      module: 'market-intelligence',
      files: [...],
      routes: [...],
      features: [...]
    });
    
    const result = await agent.execute(context);
  `
};

// Default export for convenience
export default RuleAgent;
