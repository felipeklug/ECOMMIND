/**
 * Rule Agent Types
 * Type definitions for the governance system
 */

export interface RuleContext {
  module: string;
  files: GeneratedFile[];
  routes: GeneratedRoute[];
  features: string[];
  brandTokens?: string;
  timestamp: string;
  version: string;
}

export interface GeneratedFile {
  path: string;
  type: 'component' | 'page' | 'api' | 'hook' | 'util' | 'style' | 'config' | 'migration';
  content?: string;
  size: number;
  dependencies: string[];
  exports: string[];
  imports: string[];
}

export interface GeneratedRoute {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  type: 'api' | 'page';
  auth: boolean;
  rls: boolean;
  validation: boolean;
  rateLimit: boolean;
}

export interface CheckResult {
  checkName: string;
  passed: boolean;
  severity: 'info' | 'warning' | 'error';
  issues: Issue[];
  score: number; // 0-100
  recommendations: string[];
}

export interface Issue {
  type: string;
  severity: 'info' | 'warning' | 'error';
  message: string;
  file?: string;
  line?: number;
  column?: number;
  rule: string;
  suggestion?: string;
  autoFixable?: boolean;
}

export interface RuleAgentResult {
  passed: boolean;
  overallScore: number;
  checks: CheckResult[];
  summary: {
    totalIssues: number;
    errorCount: number;
    warningCount: number;
    infoCount: number;
  };
  recommendations: string[];
  gateStatus: 'pass' | 'warning' | 'fail';
}

export interface BrandTokens {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
    muted: string;
    accent: string;
    destructive: string;
    border: string;
    input: string;
    ring: string;
  };
  typography: {
    fontFamily: string;
    fontSize: Record<string, string>;
    fontWeight: Record<string, string>;
    lineHeight: Record<string, string>;
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
  breakpoints: Record<string, string>;
}

export interface UIKitComponent {
  name: string;
  path: string;
  required: boolean;
  props: string[];
  variants?: string[];
  dependencies: string[];
}

export interface AllowedDirectory {
  path: string;
  purpose: string;
  required: boolean;
  allowedFileTypes: string[];
  namingConvention: string;
}

export interface EventBusContract {
  events: EventDefinition[];
  channels: string[];
  middleware: string[];
}

export interface EventDefinition {
  name: string;
  payload: Record<string, any>;
  channel: string;
  required: boolean;
  description: string;
}

export interface CheckConfig {
  enabled: boolean;
  severity: 'info' | 'warning' | 'error';
  rules: Record<string, any>;
  fixtures: string[];
}

export interface RuleAgentConfig {
  version: string;
  checks: {
    branding: CheckConfig;
    architecture: CheckConfig;
    integration: CheckConfig;
  };
  reporters: string[];
  gating: {
    enabled: boolean;
    failOnError: boolean;
    failOnWarningCount: number;
  };
  fixtures: {
    brandTokens: string;
    allowedDirs: string;
    uiKit: string;
    eventBusContract: string;
  };
}

export abstract class BaseCheck {
  abstract name: string;
  abstract description: string;
  
  abstract run(context: RuleContext): Promise<CheckResult>;
  
  protected createIssue(
    type: string,
    severity: 'info' | 'warning' | 'error',
    message: string,
    rule: string,
    file?: string,
    suggestion?: string
  ): Issue {
    return {
      type,
      severity,
      message,
      rule,
      file,
      suggestion,
      autoFixable: false,
    };
  }
  
  protected calculateScore(issues: Issue[]): number {
    const weights = { error: -20, warning: -10, info: -2 };
    const penalty = issues.reduce((sum, issue) => sum + weights[issue.severity], 0);
    return Math.max(0, Math.min(100, 100 + penalty));
  }
}

export abstract class BaseReporter {
  abstract name: string;
  abstract report(result: RuleAgentResult, context: RuleContext): Promise<void>;
}

export interface FileAnalysis {
  hasTypeScript: boolean;
  hasReact: boolean;
  hasNextJS: boolean;
  hasShadcnUI: boolean;
  hasFramerMotion: boolean;
  hasTailwind: boolean;
  hasZod: boolean;
  hasSupabase: boolean;
  hasSWR: boolean;
  imports: string[];
  exports: string[];
  components: string[];
  hooks: string[];
  apis: string[];
}

export interface SecurityAnalysis {
  hasRLS: boolean;
  hasValidation: boolean;
  hasRateLimit: boolean;
  hasAuth: boolean;
  hasLogging: boolean;
  hasPIIProtection: boolean;
  vulnerabilities: string[];
}

export interface A11yAnalysis {
  hasAriaLabels: boolean;
  hasKeyboardNav: boolean;
  hasColorContrast: boolean;
  hasSemanticHTML: boolean;
  hasFocusManagement: boolean;
  issues: string[];
}
