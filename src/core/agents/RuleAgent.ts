/**
 * ECOMMIND Rule Agent - Guardian dos 3 Prompts Fundamentais
 * Valida UX Premium + Arquitetura Técnica + Integração & Workflows
 */

import fs from 'fs';
import path from 'path';
import { createLogger } from '@/lib/logger';

const logger = createLogger('RuleAgent');

interface RuleCheck {
  id: string;
  name: string;
  description: string;
  required: boolean;
  category: 'critical' | 'high' | 'medium' | 'low';
  validator: (context: ValidationContext) => Promise<RuleResult>;
}

interface RuleResult {
  passed: boolean;
  message: string;
  details?: string[];
  suggestions?: string[];
}

interface ValidationContext {
  pr: string;
  modules?: string[];
  projectRoot: string;
  changedFiles: string[];
  apiRoutes: string[];
  components: string[];
  schemas: string[];
}

interface RuleAgentResult {
  overallScore: number;
  gateStatus: 'PASS' | 'FAIL' | 'WARNING';
  summary: {
    totalChecks: number;
    passed: number;
    failed: number;
    warnings: number;
    criticalIssues: number;
  };
  categories: {
    ux: RuleResult[];
    tech: RuleResult[];
    workflow: RuleResult[];
  };
  recommendations: string[];
}

export class RuleAgent {
  private uxRules: RuleCheck[] = [];
  private techRules: RuleCheck[] = [];
  private workflowRules: RuleCheck[] = [];

  constructor() {
    this.loadRules();
  }

  private loadRules(): void {
    // UX/UI + Branding Premium Rules
    this.uxRules = [
      {
        id: 'ux-001',
        name: 'Brand Tokens Usage',
        description: 'Verifica uso de tokens de cor da marca',
        required: true,
        category: 'critical',
        validator: this.validateBrandTokens,
      },
      {
        id: 'ux-002',
        name: 'Inter Font Usage',
        description: 'Verifica uso da fonte Inter',
        required: true,
        category: 'critical',
        validator: this.validateInterFont,
      },
      {
        id: 'ux-003',
        name: 'Light/Dark Theme Support',
        description: 'Verifica suporte a tema light default e dark opt-in',
        required: true,
        category: 'high',
        validator: this.validateThemeSupport,
      },
      {
        id: 'ux-004',
        name: 'Framer Motion Microinteractions',
        description: 'Verifica uso de microinterações com Framer Motion',
        required: false,
        category: 'medium',
        validator: this.validateFramerMotion,
      },
      {
        id: 'ux-005',
        name: 'Accessibility AA Compliance',
        description: 'Verifica conformidade com WCAG AA',
        required: true,
        category: 'critical',
        validator: this.validateAccessibility,
      },
    ];

    // Arquitetura Técnica Rules
    this.techRules = [
      {
        id: 'tech-001',
        name: 'Next.js App Router Usage',
        description: 'Verifica uso do App Router (não Pages Router)',
        required: true,
        category: 'critical',
        validator: this.validateAppRouter,
      },
      {
        id: 'tech-002',
        name: 'TypeScript Strict Mode',
        description: 'Verifica TypeScript strict habilitado',
        required: true,
        category: 'critical',
        validator: this.validateTypeScriptStrict,
      },
      {
        id: 'tech-003',
        name: 'Zod Validation in APIs',
        description: 'Verifica uso de Zod em APIs alteradas',
        required: true,
        category: 'critical',
        validator: this.validateZodInAPIs,
      },
      {
        id: 'tech-004',
        name: 'RLS in Database Tables',
        description: 'Verifica Row Level Security nas tabelas tocadas',
        required: true,
        category: 'critical',
        validator: this.validateRLS,
      },
      {
        id: 'tech-005',
        name: 'Structured Logs without PII',
        description: 'Verifica logs estruturados sem PII',
        required: true,
        category: 'high',
        validator: this.validateSecureLogs,
      },
      {
        id: 'tech-006',
        name: 'Rate Limiting',
        description: 'Verifica rate limiting em APIs públicas',
        required: true,
        category: 'high',
        validator: this.validateRateLimit,
      },
    ];

    // Integração & Workflows Rules
    this.workflowRules = [
      {
        id: 'workflow-001',
        name: 'Module Agent Pattern',
        description: 'Verifica padrão de agente por módulo',
        required: false,
        category: 'medium',
        validator: this.validateModuleAgent,
      },
      {
        id: 'workflow-002',
        name: 'Mission Integration',
        description: 'Verifica integração com sistema de Missões',
        required: false,
        category: 'medium',
        validator: this.validateMissionIntegration,
      },
      {
        id: 'workflow-003',
        name: 'Event Bus Integration',
        description: 'Verifica eventos para Event Bus',
        required: false,
        category: 'medium',
        validator: this.validateEventBus,
      },
      {
        id: 'workflow-004',
        name: 'Deduplication Logic',
        description: 'Verifica lógica de deduplicação onde aplicável',
        required: false,
        category: 'low',
        validator: this.validateDeduplication,
      },
    ];
  }

  /**
   * Executa validação completa dos 3 prompts fundamentais
   */
  async assertAllRules(meta: { pr: string; modules?: string[] }): Promise<RuleAgentResult> {
    logger.info('🛡️ Rule Agent - Iniciando validação', { pr: meta.pr, modules: meta.modules });

    const context: ValidationContext = {
      pr: meta.pr,
      modules: meta.modules || [],
      projectRoot: process.cwd(),
      changedFiles: await this.getChangedFiles(),
      apiRoutes: await this.getApiRoutes(),
      components: await this.getComponents(),
      schemas: await this.getSchemas(),
    };

    // Executar validações por categoria
    const uxResults = await this.runRuleCategory(this.uxRules, context);
    const techResults = await this.runRuleCategory(this.techRules, context);
    const workflowResults = await this.runRuleCategory(this.workflowRules, context);

    // Calcular score e status
    const allResults = [...uxResults, ...techResults, ...workflowResults];
    const totalChecks = allResults.length;
    const passed = allResults.filter(r => r.passed).length;
    const failed = allResults.filter(r => !r.passed).length;
    const criticalIssues = allResults.filter(r => !r.passed && this.isCriticalRule(r)).length;

    const overallScore = Math.round((passed / totalChecks) * 100);
    const gateStatus = criticalIssues > 0 ? 'FAIL' : overallScore >= 80 ? 'PASS' : 'WARNING';

    const result: RuleAgentResult = {
      overallScore,
      gateStatus,
      summary: {
        totalChecks,
        passed,
        failed,
        warnings: failed - criticalIssues,
        criticalIssues,
      },
      categories: {
        ux: uxResults,
        tech: techResults,
        workflow: workflowResults,
      },
      recommendations: this.generateRecommendations(allResults),
    };

    // Log resultado
    logger.info('🛡️ Rule Agent - Validação concluída', {
      pr: meta.pr,
      score: overallScore,
      status: gateStatus,
      criticalIssues,
    });

    // Falhar se houver issues críticos
    if (gateStatus === 'FAIL') {
      const criticalMessages = allResults
        .filter(r => !r.passed && this.isCriticalRule(r))
        .map(r => `❌ ${r.message}`)
        .join('\n');

      throw new Error(`🛡️ Rule Agent FAILED - Issues críticos encontrados:\n${criticalMessages}`);
    }

    return result;
  }

  private async runRuleCategory(rules: RuleCheck[], context: ValidationContext): Promise<RuleResult[]> {
    const results: RuleResult[] = [];

    for (const rule of rules) {
      try {
        const result = await rule.validator.call(this, context);
        results.push({
          ...result,
          message: `[${rule.id}] ${rule.name}: ${result.message}`,
        });
      } catch (error) {
        results.push({
          passed: false,
          message: `[${rule.id}] ${rule.name}: Erro na validação - ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }

    return results;
  }

  private isCriticalRule(result: RuleResult): boolean {
    const ruleId = result.message.match(/\[([^\]]+)\]/)?.[1];
    const allRules = [...this.uxRules, ...this.techRules, ...this.workflowRules];
    const rule = allRules.find(r => r.id === ruleId);
    return rule?.category === 'critical' || false;
  }

  private generateRecommendations(results: RuleResult[]): string[] {
    const recommendations: string[] = [];
    
    results.forEach(result => {
      if (!result.passed && result.suggestions) {
        recommendations.push(...result.suggestions);
      }
    });

    return [...new Set(recommendations)]; // Remove duplicatas
  }

  // =====================================================
  // UX VALIDATORS
  // =====================================================

  private async validateBrandTokens(context: ValidationContext): Promise<RuleResult> {
    const globalsPath = path.join(context.projectRoot, 'src/app/globals.css');
    
    if (!fs.existsSync(globalsPath)) {
      return {
        passed: false,
        message: 'globals.css não encontrado',
        suggestions: ['Criar src/app/globals.css com tokens da marca'],
      };
    }

    const content = fs.readFileSync(globalsPath, 'utf-8');
    const hasTokens = content.includes('--color-') || content.includes('@theme inline');

    return {
      passed: hasTokens,
      message: hasTokens ? 'Tokens da marca encontrados' : 'Tokens da marca não encontrados',
      suggestions: hasTokens ? [] : ['Adicionar tokens de cor da marca em globals.css'],
    };
  }

  private async validateInterFont(context: ValidationContext): Promise<RuleResult> {
    const layoutPath = path.join(context.projectRoot, 'src/app/layout.tsx');
    
    if (!fs.existsSync(layoutPath)) {
      return {
        passed: false,
        message: 'layout.tsx não encontrado',
        suggestions: ['Configurar fonte Inter no layout principal'],
      };
    }

    const content = fs.readFileSync(layoutPath, 'utf-8');
    const hasInter = content.includes('Inter') || content.includes('font-inter');

    return {
      passed: hasInter,
      message: hasInter ? 'Fonte Inter configurada' : 'Fonte Inter não encontrada',
      suggestions: hasInter ? [] : ['Configurar fonte Inter no layout principal'],
    };
  }

  private async validateThemeSupport(context: ValidationContext): Promise<RuleResult> {
    // Verificar se há suporte a tema dark/light
    const hasThemeProvider = context.components.some(file => 
      file.includes('theme') || file.includes('Theme')
    );

    return {
      passed: hasThemeProvider,
      message: hasThemeProvider ? 'Suporte a tema encontrado' : 'Suporte a tema não encontrado',
      suggestions: hasThemeProvider ? [] : ['Implementar ThemeProvider com light default e dark opt-in'],
    };
  }

  private async validateFramerMotion(context: ValidationContext): Promise<RuleResult> {
    const packageJsonPath = path.join(context.projectRoot, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      return { passed: false, message: 'package.json não encontrado' };
    }

    const content = fs.readFileSync(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(content);
    const hasFramerMotion = packageJson.dependencies?.['framer-motion'] || 
                           packageJson.devDependencies?.['framer-motion'];

    return {
      passed: hasFramerMotion || false,
      message: hasFramerMotion ? 'Framer Motion configurado' : 'Framer Motion não encontrado',
      suggestions: hasFramerMotion ? [] : ['Instalar e usar Framer Motion para microinterações'],
    };
  }

  private async validateAccessibility(context: ValidationContext): Promise<RuleResult> {
    const packageJsonPath = path.join(context.projectRoot, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      return { passed: false, message: 'package.json não encontrado' };
    }

    const content = fs.readFileSync(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(content);
    const hasA11yPlugin = packageJson.devDependencies?.['eslint-plugin-jsx-a11y'];

    return {
      passed: hasA11yPlugin || false,
      message: hasA11yPlugin ? 'Plugin de acessibilidade configurado' : 'Plugin de acessibilidade não encontrado',
      suggestions: hasA11yPlugin ? [] : ['Instalar eslint-plugin-jsx-a11y para validação de acessibilidade'],
    };
  }

  // =====================================================
  // TECH VALIDATORS
  // =====================================================

  private async validateAppRouter(context: ValidationContext): Promise<RuleResult> {
    const hasAppDir = fs.existsSync(path.join(context.projectRoot, 'src/app'));
    const hasPagesDir = fs.existsSync(path.join(context.projectRoot, 'src/pages'));

    return {
      passed: hasAppDir && !hasPagesDir,
      message: hasAppDir && !hasPagesDir ? 'App Router em uso' : 'Pages Router detectado ou App Router ausente',
      suggestions: hasAppDir && !hasPagesDir ? [] : ['Migrar para Next.js App Router'],
    };
  }

  private async validateTypeScriptStrict(context: ValidationContext): Promise<RuleResult> {
    const tsconfigPath = path.join(context.projectRoot, 'tsconfig.json');
    
    if (!fs.existsSync(tsconfigPath)) {
      return { passed: false, message: 'tsconfig.json não encontrado' };
    }

    const content = fs.readFileSync(tsconfigPath, 'utf-8');
    const tsconfig = JSON.parse(content);
    const isStrict = tsconfig.compilerOptions?.strict === true;

    return {
      passed: isStrict,
      message: isStrict ? 'TypeScript strict habilitado' : 'TypeScript strict não habilitado',
      suggestions: isStrict ? [] : ['Habilitar "strict": true no tsconfig.json'],
    };
  }

  private async validateZodInAPIs(context: ValidationContext): Promise<RuleResult> {
    const apiFiles = context.apiRoutes.filter(file => 
      context.changedFiles.some(changed => changed.includes(file))
    );

    if (apiFiles.length === 0) {
      return { passed: true, message: 'Nenhuma API alterada' };
    }

    let zodUsageCount = 0;
    for (const apiFile of apiFiles) {
      const fullPath = path.join(context.projectRoot, apiFile);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        if (content.includes('z.') || content.includes('zod')) {
          zodUsageCount++;
        }
      }
    }

    const allUsingZod = zodUsageCount === apiFiles.length;

    return {
      passed: allUsingZod,
      message: allUsingZod ? 'Zod usado em todas as APIs alteradas' : `Zod ausente em ${apiFiles.length - zodUsageCount} APIs`,
      suggestions: allUsingZod ? [] : ['Adicionar validação Zod em todas as APIs'],
    };
  }

  private async validateRLS(context: ValidationContext): Promise<RuleResult> {
    // Verificar se há migrações com RLS
    const migrationsDir = path.join(context.projectRoot, 'supabase/migrations');
    
    if (!fs.existsSync(migrationsDir)) {
      return { passed: true, message: 'Nenhuma migração encontrada' };
    }

    const migrationFiles = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
    let rlsCount = 0;

    for (const file of migrationFiles) {
      const content = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      if (content.includes('enable row level security') || content.includes('create policy')) {
        rlsCount++;
      }
    }

    return {
      passed: rlsCount > 0,
      message: rlsCount > 0 ? `RLS encontrado em ${rlsCount} migrações` : 'RLS não encontrado',
      suggestions: rlsCount > 0 ? [] : ['Adicionar Row Level Security nas tabelas sensíveis'],
    };
  }

  private async validateSecureLogs(context: ValidationContext): Promise<RuleResult> {
    // Verificar se há uso de logSecure ou logger estruturado
    const hasSecureLogging = context.changedFiles.some(file => {
      const fullPath = path.join(context.projectRoot, file);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        return content.includes('logSecure') || content.includes('createLogger');
      }
      return false;
    });

    return {
      passed: hasSecureLogging,
      message: hasSecureLogging ? 'Logs seguros encontrados' : 'Logs seguros não encontrados',
      suggestions: hasSecureLogging ? [] : ['Usar logSecure() para logs sem PII'],
    };
  }

  private async validateRateLimit(context: ValidationContext): Promise<RuleResult> {
    // Verificar rate limiting em APIs públicas
    const publicApis = context.apiRoutes.filter(route => 
      !route.includes('/(app)/') && (route.includes('/api/') || route.includes('/auth/'))
    );

    if (publicApis.length === 0) {
      return { passed: true, message: 'Nenhuma API pública encontrada' };
    }

    // Verificar se há middleware ou rate limiting
    const middlewarePath = path.join(context.projectRoot, 'src/middleware.ts');
    const hasRateLimit = fs.existsSync(middlewarePath);

    return {
      passed: hasRateLimit,
      message: hasRateLimit ? 'Rate limiting configurado' : 'Rate limiting não encontrado',
      suggestions: hasRateLimit ? [] : ['Implementar rate limiting em APIs públicas'],
    };
  }

  // =====================================================
  // WORKFLOW VALIDATORS
  // =====================================================

  private async validateModuleAgent(context: ValidationContext): Promise<RuleResult> {
    if (!context.modules || context.modules.length === 0) {
      return { passed: true, message: 'Nenhum módulo especificado' };
    }

    // Verificar se há agentes para os módulos
    const agentsDir = path.join(context.projectRoot, 'src/core/agents');
    const hasAgents = context.modules.some(module => {
      const agentPath = path.join(agentsDir, `${module}Agent.ts`);
      return fs.existsSync(agentPath);
    });

    return {
      passed: hasAgents,
      message: hasAgents ? 'Agentes de módulo encontrados' : 'Agentes de módulo não encontrados',
      suggestions: hasAgents ? [] : ['Implementar agentes específicos por módulo'],
    };
  }

  private async validateMissionIntegration(context: ValidationContext): Promise<RuleResult> {
    // Verificar integração com sistema de Missões
    const hasMissionIntegration = context.changedFiles.some(file => {
      const fullPath = path.join(context.projectRoot, file);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        return content.includes('Mission') || content.includes('mission');
      }
      return false;
    });

    return {
      passed: hasMissionIntegration,
      message: hasMissionIntegration ? 'Integração com Missões encontrada' : 'Integração com Missões não encontrada',
      suggestions: hasMissionIntegration ? [] : ['Adicionar integração com sistema de Missões onde aplicável'],
    };
  }

  private async validateEventBus(context: ValidationContext): Promise<RuleResult> {
    // Verificar uso de Event Bus
    const hasEventBus = context.changedFiles.some(file => {
      const fullPath = path.join(context.projectRoot, file);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        return content.includes('EventBus') || content.includes('emit') || content.includes('publish');
      }
      return false;
    });

    return {
      passed: hasEventBus,
      message: hasEventBus ? 'Event Bus encontrado' : 'Event Bus não encontrado',
      suggestions: hasEventBus ? [] : ['Implementar eventos para Event Bus onde aplicável'],
    };
  }

  private async validateDeduplication(context: ValidationContext): Promise<RuleResult> {
    // Verificar lógica de deduplicação
    const hasDeduplication = context.changedFiles.some(file => {
      const fullPath = path.join(context.projectRoot, file);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        return content.includes('dedupe') || content.includes('duplicate') || content.includes('unique');
      }
      return false;
    });

    return {
      passed: hasDeduplication,
      message: hasDeduplication ? 'Lógica de deduplicação encontrada' : 'Lógica de deduplicação não encontrada',
      suggestions: hasDeduplication ? [] : ['Implementar deduplicação onde aplicável'],
    };
  }

  // =====================================================
  // HELPER METHODS
  // =====================================================

  private async getChangedFiles(): Promise<string[]> {
    // Em um ambiente real, isso viria do Git ou CI/CD
    // Por agora, retorna uma lista mock
    return [];
  }

  private async getApiRoutes(): Promise<string[]> {
    const apiDir = path.join(process.cwd(), 'src/app/api');
    if (!fs.existsSync(apiDir)) return [];

    const routes: string[] = [];
    const scanDir = (dir: string, basePath = '') => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const relativePath = path.join(basePath, item);
        
        if (fs.statSync(fullPath).isDirectory()) {
          scanDir(fullPath, relativePath);
        } else if (item === 'route.ts' || item === 'route.js') {
          routes.push(path.join('src/app/api', basePath, item));
        }
      }
    };

    scanDir(apiDir);
    return routes;
  }

  private async getComponents(): Promise<string[]> {
    const componentsDir = path.join(process.cwd(), 'src/components');
    if (!fs.existsSync(componentsDir)) return [];

    const components: string[] = [];
    const scanDir = (dir: string) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
          scanDir(fullPath);
        } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
          components.push(fullPath);
        }
      }
    };

    scanDir(componentsDir);
    return components;
  }

  private async getSchemas(): Promise<string[]> {
    const schemasDir = path.join(process.cwd(), 'src/core/validation');
    if (!fs.existsSync(schemasDir)) return [];

    return fs.readdirSync(schemasDir)
      .filter(file => file.endsWith('.ts') || file.endsWith('.js'))
      .map(file => path.join(schemasDir, file));
  }
}

/**
 * Função principal para validação de regras
 */
export async function assertAllRules(meta: { pr: string; modules?: string[] }): Promise<void> {
  const agent = new RuleAgent();
  await agent.assertAllRules(meta);
}

export default RuleAgent;
