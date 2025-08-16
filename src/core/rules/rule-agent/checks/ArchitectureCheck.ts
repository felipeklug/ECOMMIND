/**
 * Architecture Check
 * Validates technical architecture and security compliance
 */

import { BaseCheck, CheckResult, RuleContext, Issue, SecurityAnalysis } from '../types';
import allowedDirs from '../fixtures/allowed-dirs.json';

export class ArchitectureCheck extends BaseCheck {
  name = 'Architecture & Security';
  description = 'Validates Next.js App Router, TypeScript, security, and architectural patterns';

  async run(context: RuleContext): Promise<CheckResult> {
    const issues: Issue[] = [];
    
    // Check directory structure
    issues.push(...await this.checkDirectoryStructure(context));
    
    // Check each file for architectural compliance
    for (const file of context.files) {
      issues.push(...await this.checkFileArchitecture(file, context));
      
      if (file.type === 'api') {
        issues.push(...await this.checkAPIArchitecture(file, context));
      }
      
      if (file.type === 'component' || file.type === 'page') {
        issues.push(...await this.checkReactArchitecture(file, context));
      }
    }
    
    // Check routes for security
    for (const route of context.routes) {
      issues.push(...await this.checkRouteArchitecture(route, context));
    }
    
    const score = this.calculateScore(issues);
    const passed = score >= 85 && !issues.some(i => i.severity === 'error');
    
    return {
      checkName: this.name,
      passed,
      severity: passed ? 'info' : 'error',
      issues,
      score,
      recommendations: this.generateRecommendations(issues),
    };
  }

  private async checkDirectoryStructure(context: RuleContext): Promise<Issue[]> {
    const issues: Issue[] = [];
    
    // Check for required directories
    const requiredDirs = allowedDirs.directories.filter(d => d.required);
    for (const dir of requiredDirs) {
      const hasDir = context.files.some(f => f.path.startsWith(dir.path));
      if (!hasDir) {
        issues.push(this.createIssue(
          'missing_required_directory',
          'error',
          `Missing required directory: ${dir.path}`,
          'directory_structure',
          undefined,
          `Create ${dir.path} directory for ${dir.purpose}`
        ));
      }
    }
    
    // Check for forbidden directories
    for (const forbidden of allowedDirs.forbidden) {
      const hasForbidden = context.files.some(f => f.path.startsWith(forbidden.path));
      if (hasForbidden) {
        issues.push(this.createIssue(
          'forbidden_directory',
          'error',
          `Using forbidden directory: ${forbidden.path}. ${forbidden.reason}`,
          'directory_structure',
          undefined,
          'Move files to appropriate allowed directories'
        ));
      }
    }
    
    // Check for App Router usage (no pages directory)
    const usesPagesRouter = context.files.some(f => f.path.startsWith('src/pages/'));
    if (usesPagesRouter) {
      issues.push(this.createIssue(
        'pages_router_usage',
        'error',
        'Using Pages Router. Must use App Router (src/app/)',
        'next_js_patterns',
        undefined,
        'Migrate from src/pages/ to src/app/ directory'
      ));
    }
    
    return issues;
  }

  private async checkFileArchitecture(file: any, context: RuleContext): Promise<Issue[]> {
    const issues: Issue[] = [];
    const content = file.content || '';
    
    // Check TypeScript usage
    if (!file.path.endsWith('.ts') && !file.path.endsWith('.tsx')) {
      issues.push(this.createIssue(
        'not_typescript',
        'error',
        'All files must use TypeScript (.ts or .tsx)',
        'typescript',
        file.path,
        'Convert to TypeScript and add proper types'
      ));
    }
    
    // Check for 'any' type usage
    if (this.usesAnyType(content)) {
      issues.push(this.createIssue(
        'uses_any_type',
        'error',
        'Avoid using "any" type. Use proper TypeScript types',
        'typescript_strict',
        file.path,
        'Replace "any" with specific types or interfaces'
      ));
    }
    
    // Check for proper imports
    if (this.hasRelativeImports(content)) {
      issues.push(this.createIssue(
        'relative_imports',
        'warning',
        'Prefer absolute imports using @ alias',
        'import_patterns',
        file.path,
        'Use @/components, @/lib, @/hooks instead of relative paths'
      ));
    }
    
    // Check for proper exports
    if (!this.hasProperExports(content, file.type)) {
      issues.push(this.createIssue(
        'improper_exports',
        'warning',
        'File should follow export conventions for its type',
        'export_patterns',
        file.path,
        'Use appropriate export pattern (named vs default)'
      ));
    }
    
    // Check for console.log usage
    if (this.hasConsoleLog(content)) {
      issues.push(this.createIssue(
        'console_log_usage',
        'warning',
        'Remove console.log statements. Use proper logging',
        'logging',
        file.path,
        'Use logger utility instead of console.log'
      ));
    }
    
    return issues;
  }

  private async checkAPIArchitecture(file: any, context: RuleContext): Promise<Issue[]> {
    const issues: Issue[] = [];
    const content = file.content || '';
    
    // Check for Zod validation
    if (!this.usesZodValidation(content)) {
      issues.push(this.createIssue(
        'missing_zod_validation',
        'error',
        'API routes must use Zod for input validation',
        'api_validation',
        file.path,
        'Add Zod schema validation for request body and params'
      ));
    }
    
    // Check for authentication
    if (!this.hasAuthentication(content)) {
      issues.push(this.createIssue(
        'missing_authentication',
        'error',
        'API routes must implement authentication',
        'api_security',
        file.path,
        'Add validateApiAccess() or similar auth check'
      ));
    }
    
    // Check for RLS (Row Level Security)
    if (!this.implementsRLS(content)) {
      issues.push(this.createIssue(
        'missing_rls',
        'error',
        'API routes must implement Row Level Security',
        'database_security',
        file.path,
        'Ensure queries filter by company_id or user_id'
      ));
    }
    
    // Check for rate limiting
    if (!this.hasRateLimiting(content)) {
      issues.push(this.createIssue(
        'missing_rate_limiting',
        'warning',
        'API routes should implement rate limiting',
        'api_security',
        file.path,
        'Add rate limiting middleware or checks'
      ));
    }
    
    // Check for proper error handling
    if (!this.hasProperErrorHandling(content)) {
      issues.push(this.createIssue(
        'poor_error_handling',
        'warning',
        'API routes should have comprehensive error handling',
        'error_handling',
        file.path,
        'Add try-catch blocks and return proper HTTP status codes'
      ));
    }
    
    // Check for secure logging
    if (!this.hasSecureLogging(content)) {
      issues.push(this.createIssue(
        'insecure_logging',
        'warning',
        'API routes should use secure logging (no PII)',
        'secure_logging',
        file.path,
        'Use logSecure() function and avoid logging sensitive data'
      ));
    }
    
    return issues;
  }

  private async checkReactArchitecture(file: any, context: RuleContext): Promise<Issue[]> {
    const issues: Issue[] = [];
    const content = file.content || '';
    
    // Check for Server Components by default
    if (this.isClientComponent(content) && !this.needsClientComponent(content)) {
      issues.push(this.createIssue(
        'unnecessary_client_component',
        'warning',
        'Use Server Components by default. Only use "use client" when necessary',
        'react_patterns',
        file.path,
        'Remove "use client" if component doesn\'t need interactivity'
      ));
    }
    
    // Check for proper hook usage
    if (this.hasImproperHookUsage(content)) {
      issues.push(this.createIssue(
        'improper_hook_usage',
        'warning',
        'Hooks should follow React rules and naming conventions',
        'react_hooks',
        file.path,
        'Ensure hooks start with "use" and follow rules of hooks'
      ));
    }
    
    // Check for SWR usage for data fetching
    if (this.hasDataFetching(content) && !this.usesSWR(content)) {
      issues.push(this.createIssue(
        'missing_swr',
        'info',
        'Consider using SWR for data fetching and caching',
        'data_fetching',
        file.path,
        'Use useSWR hook for API calls and caching'
      ));
    }
    
    // Check for proper component structure
    if (!this.hasProperComponentStructure(content)) {
      issues.push(this.createIssue(
        'poor_component_structure',
        'info',
        'Component should follow standard structure (imports, types, component, export)',
        'component_structure',
        file.path,
        'Organize imports, types, and component definition properly'
      ));
    }
    
    return issues;
  }

  private async checkRouteArchitecture(route: any, context: RuleContext): Promise<Issue[]> {
    const issues: Issue[] = [];
    
    // Check API routes for security
    if (route.type === 'api') {
      if (!route.auth) {
        issues.push(this.createIssue(
          'api_no_auth',
          'error',
          `API route ${route.path} lacks authentication`,
          'api_security',
          undefined,
          'Add authentication middleware to API route'
        ));
      }
      
      if (!route.rls) {
        issues.push(this.createIssue(
          'api_no_rls',
          'error',
          `API route ${route.path} lacks Row Level Security`,
          'database_security',
          undefined,
          'Implement RLS in database queries'
        ));
      }
      
      if (!route.validation) {
        issues.push(this.createIssue(
          'api_no_validation',
          'error',
          `API route ${route.path} lacks input validation`,
          'api_validation',
          undefined,
          'Add Zod schema validation'
        ));
      }
      
      if (!route.rateLimit) {
        issues.push(this.createIssue(
          'api_no_rate_limit',
          'warning',
          `API route ${route.path} lacks rate limiting`,
          'api_security',
          undefined,
          'Add rate limiting middleware'
        ));
      }
    }
    
    return issues;
  }

  private generateRecommendations(issues: Issue[]): string[] {
    const recommendations: string[] = [];
    
    if (issues.some(i => i.rule === 'typescript_strict')) {
      recommendations.push('Enable strict TypeScript mode and avoid "any" types');
    }
    
    if (issues.some(i => i.rule === 'api_security')) {
      recommendations.push('Implement comprehensive API security (auth, RLS, rate limiting)');
    }
    
    if (issues.some(i => i.rule === 'next_js_patterns')) {
      recommendations.push('Migrate to Next.js App Router for better performance');
    }
    
    if (issues.some(i => i.rule === 'react_patterns')) {
      recommendations.push('Use Server Components by default, Client Components only when needed');
    }
    
    if (issues.some(i => i.rule === 'directory_structure')) {
      recommendations.push('Follow established directory structure conventions');
    }
    
    return recommendations;
  }

  // Helper methods for content analysis
  private usesAnyType(content: string): boolean {
    return /:\s*any\b|<any>|\bany\[\]/.test(content);
  }

  private hasRelativeImports(content: string): boolean {
    return /import.*from\s+['"]\.\.\//.test(content);
  }

  private hasProperExports(content: string, fileType: string): boolean {
    if (fileType === 'page') {
      return /export\s+default/.test(content);
    }
    if (fileType === 'api') {
      return /export\s+(async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH)/.test(content);
    }
    return /export/.test(content);
  }

  private hasConsoleLog(content: string): boolean {
    return /console\.log|console\.warn|console\.error/.test(content);
  }

  private usesZodValidation(content: string): boolean {
    return /import.*zod|z\.|\.parse\(|\.safeParse\(/.test(content);
  }

  private hasAuthentication(content: string): boolean {
    return /validateApiAccess|auth|jwt|token/.test(content);
  }

  private implementsRLS(content: string): boolean {
    return /company_id|user_id|\.eq\(.*id/.test(content);
  }

  private hasRateLimiting(content: string): boolean {
    return /rateLimit|rate.*limit|throttle/.test(content);
  }

  private hasProperErrorHandling(content: string): boolean {
    return /try.*catch|\.catch\(|NextResponse\.json.*error/.test(content);
  }

  private hasSecureLogging(content: string): boolean {
    return /logSecure|logger\.|log.*info|log.*error/.test(content) && 
           !/console\./.test(content);
  }

  private isClientComponent(content: string): boolean {
    return /['"]use client['"]/.test(content);
  }

  private needsClientComponent(content: string): boolean {
    return /useState|useEffect|onClick|onChange|onSubmit/.test(content);
  }

  private hasImproperHookUsage(content: string): boolean {
    // Check for hooks not starting with "use"
    return /function\s+[a-z][A-Za-z]*Hook/.test(content);
  }

  private hasDataFetching(content: string): boolean {
    return /fetch\(|axios|useEffect.*async/.test(content);
  }

  private usesSWR(content: string): boolean {
    return /useSWR|import.*swr/.test(content);
  }

  private hasProperComponentStructure(content: string): boolean {
    // Check for proper order: imports, types, component, export
    const hasImports = /^import/.test(content);
    const hasComponent = /function\s+[A-Z]|const\s+[A-Z].*=/.test(content);
    const hasExport = /export/.test(content);
    
    return hasImports && hasComponent && hasExport;
  }
}
