/**
 * Rule Agent
 * Main orchestrator for governance checks
 */

import { RuleContext, RuleAgentResult, RuleAgentConfig, CheckResult } from './types';
import { BrandingCheck } from './checks/BrandingCheck';
import { ArchitectureCheck } from './checks/ArchitectureCheck';
import { IntegrationCheck } from './checks/IntegrationCheck';
import { ConsoleReporter } from './reporters/ConsoleReporter';
import { UINoticeReporter } from './reporters/UINoticeReporter';

export class RuleAgent {
  private static instance: RuleAgent;
  private config: RuleAgentConfig;
  private checks: Map<string, any>;
  private reporters: Map<string, any>;

  private constructor() {
    this.config = this.loadConfig();
    this.checks = new Map();
    this.reporters = new Map();
    this.initializeChecks();
    this.initializeReporters();
  }

  public static getInstance(): RuleAgent {
    if (!RuleAgent.instance) {
      RuleAgent.instance = new RuleAgent();
    }
    return RuleAgent.instance;
  }

  public static async run(context: RuleContext): Promise<RuleAgentResult> {
    const agent = RuleAgent.getInstance();
    return agent.execute(context);
  }

  private loadConfig(): RuleAgentConfig {
    // Default configuration
    return {
      version: '1.0.0',
      checks: {
        branding: {
          enabled: true,
          severity: 'error',
          rules: {},
          fixtures: ['brand-tokens.json', 'ui-kit.json']
        },
        architecture: {
          enabled: true,
          severity: 'error',
          rules: {},
          fixtures: ['allowed-dirs.json']
        },
        integration: {
          enabled: true,
          severity: 'warning',
          rules: {},
          fixtures: ['event-bus-contract.json']
        }
      },
      reporters: ['console', 'ui'],
      gating: {
        enabled: true,
        failOnError: true,
        failOnWarningCount: 10
      },
      fixtures: {
        brandTokens: 'src/core/rules/rule-agent/fixtures/brand-tokens.json',
        allowedDirs: 'src/core/rules/rule-agent/fixtures/allowed-dirs.json',
        uiKit: 'src/core/rules/rule-agent/fixtures/ui-kit.json',
        eventBusContract: 'src/core/rules/rule-agent/fixtures/event-bus-contract.json'
      }
    };
  }

  private initializeChecks(): void {
    this.checks.set('branding', new BrandingCheck());
    this.checks.set('architecture', new ArchitectureCheck());
    this.checks.set('integration', new IntegrationCheck());
  }

  private initializeReporters(): void {
    this.reporters.set('console', new ConsoleReporter());
    this.reporters.set('ui', new UINoticeReporter());
  }

  public async execute(context: RuleContext): Promise<RuleAgentResult> {
    console.log(`🛡️ Rule Agent starting analysis for module: ${context.module}`);
    
    const startTime = Date.now();
    const checkResults: CheckResult[] = [];
    
    try {
      // Run all enabled checks
      if (this.config.checks.branding.enabled) {
        const brandingCheck = this.checks.get('branding');
        const result = await brandingCheck.run(context);
        checkResults.push(result);
      }
      
      if (this.config.checks.architecture.enabled) {
        const architectureCheck = this.checks.get('architecture');
        const result = await architectureCheck.run(context);
        checkResults.push(result);
      }
      
      if (this.config.checks.integration.enabled) {
        const integrationCheck = this.checks.get('integration');
        const result = await integrationCheck.run(context);
        checkResults.push(result);
      }
      
      // Calculate overall results
      const result = this.calculateOverallResult(checkResults);
      
      // Report results
      await this.reportResults(result, context);
      
      const duration = Date.now() - startTime;
      console.log(`🛡️ Rule Agent completed in ${duration}ms`);
      
      return result;
      
    } catch (error) {
      console.error('🚨 Rule Agent execution failed:', error);
      
      // Return failure result
      return {
        passed: false,
        overallScore: 0,
        checks: checkResults,
        summary: {
          totalIssues: 1,
          errorCount: 1,
          warningCount: 0,
          infoCount: 0
        },
        recommendations: ['Fix Rule Agent execution error'],
        gateStatus: 'fail'
      };
    }
  }

  private calculateOverallResult(checkResults: CheckResult[]): RuleAgentResult {
    const totalIssues = checkResults.reduce((sum, check) => sum + check.issues.length, 0);
    const errorCount = checkResults.reduce((sum, check) => 
      sum + check.issues.filter(i => i.severity === 'error').length, 0);
    const warningCount = checkResults.reduce((sum, check) => 
      sum + check.issues.filter(i => i.severity === 'warning').length, 0);
    const infoCount = checkResults.reduce((sum, check) => 
      sum + check.issues.filter(i => i.severity === 'info').length, 0);
    
    // Calculate overall score (weighted average)
    const weights = {
      branding: 0.4,
      architecture: 0.4,
      integration: 0.2
    };
    
    let weightedScore = 0;
    let totalWeight = 0;
    
    checkResults.forEach(check => {
      const checkType = this.getCheckType(check.checkName);
      const weight = weights[checkType as keyof typeof weights] || 0.1;
      weightedScore += check.score * weight;
      totalWeight += weight;
    });
    
    const overallScore = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
    
    // Determine gate status
    let gateStatus: 'pass' | 'warning' | 'fail' = 'pass';
    
    if (this.config.gating.enabled) {
      if (errorCount > 0 && this.config.gating.failOnError) {
        gateStatus = 'fail';
      } else if (warningCount >= this.config.gating.failOnWarningCount) {
        gateStatus = 'fail';
      } else if (warningCount > 0 || overallScore < 80) {
        gateStatus = 'warning';
      }
    }
    
    // Collect all recommendations
    const recommendations = checkResults.reduce((acc, check) => {
      return acc.concat(check.recommendations);
    }, [] as string[]);
    
    // Remove duplicates
    const uniqueRecommendations = [...new Set(recommendations)];
    
    return {
      passed: gateStatus === 'pass',
      overallScore,
      checks: checkResults,
      summary: {
        totalIssues,
        errorCount,
        warningCount,
        infoCount
      },
      recommendations: uniqueRecommendations,
      gateStatus
    };
  }

  private getCheckType(checkName: string): string {
    if (checkName.includes('Branding')) return 'branding';
    if (checkName.includes('Architecture')) return 'architecture';
    if (checkName.includes('Integration')) return 'integration';
    return 'unknown';
  }

  private async reportResults(result: RuleAgentResult, context: RuleContext): Promise<void> {
    // Report to all configured reporters
    for (const reporterName of this.config.reporters) {
      const reporter = this.reporters.get(reporterName);
      if (reporter) {
        try {
          await reporter.report(result, context);
        } catch (error) {
          console.error(`Failed to report to ${reporterName}:`, error);
        }
      }
    }
  }

  // Utility methods for creating context
  public static createContext(options: {
    module: string;
    files?: any[];
    routes?: any[];
    features?: string[];
    brandTokens?: string;
  }): RuleContext {
    return {
      module: options.module,
      files: options.files || [],
      routes: options.routes || [],
      features: options.features || [],
      brandTokens: options.brandTokens,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  public static createFileInfo(options: {
    path: string;
    type: 'component' | 'page' | 'api' | 'hook' | 'util' | 'style' | 'config' | 'migration';
    content?: string;
    dependencies?: string[];
    exports?: string[];
    imports?: string[];
  }) {
    return {
      path: options.path,
      type: options.type,
      content: options.content || '',
      size: options.content?.length || 0,
      dependencies: options.dependencies || [],
      exports: options.exports || [],
      imports: options.imports || []
    };
  }

  public static createRouteInfo(options: {
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    type: 'api' | 'page';
    auth?: boolean;
    rls?: boolean;
    validation?: boolean;
    rateLimit?: boolean;
  }) {
    return {
      path: options.path,
      method: options.method,
      type: options.type,
      auth: options.auth || false,
      rls: options.rls || false,
      validation: options.validation || false,
      rateLimit: options.rateLimit || false
    };
  }

  // Configuration methods
  public updateConfig(newConfig: Partial<RuleAgentConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): RuleAgentConfig {
    return { ...this.config };
  }

  // Check management
  public addCheck(name: string, check: any): void {
    this.checks.set(name, check);
  }

  public removeCheck(name: string): void {
    this.checks.delete(name);
  }

  // Reporter management
  public addReporter(name: string, reporter: any): void {
    this.reporters.set(name, reporter);
  }

  public removeReporter(name: string): void {
    this.reporters.delete(name);
  }
}
