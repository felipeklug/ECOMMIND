/**
 * Branding Check
 * Validates UX/UI + Branding Premium compliance
 */

import { BaseCheck, CheckResult, RuleContext, Issue, BrandTokens, UIKitComponent } from '../types';
import brandTokens from '../fixtures/brand-tokens.json';
import uiKit from '../fixtures/ui-kit.json';

export class BrandingCheck extends BaseCheck {
  name = 'Branding & UX Premium';
  description = 'Validates Uber/Nubank/Netflix level design standards';

  async run(context: RuleContext): Promise<CheckResult> {
    const issues: Issue[] = [];
    
    // Check each file for branding compliance
    for (const file of context.files) {
      if (file.type === 'component' || file.type === 'page') {
        issues.push(...await this.checkComponentBranding(file, context));
      }
      
      if (file.type === 'style') {
        issues.push(...await this.checkStyleBranding(file, context));
      }
    }
    
    // Check overall module compliance
    issues.push(...await this.checkModuleCompliance(context));
    
    const score = this.calculateScore(issues);
    const passed = score >= 80 && !issues.some(i => i.severity === 'error');
    
    return {
      checkName: this.name,
      passed,
      severity: passed ? 'info' : 'error',
      issues,
      score,
      recommendations: this.generateRecommendations(issues),
    };
  }

  private async checkComponentBranding(file: any, context: RuleContext): Promise<Issue[]> {
    const issues: Issue[] = [];
    const content = file.content || '';
    
    // Check for required UI components
    const requiredComponents = uiKit.baseComponents.filter(c => c.required);
    for (const component of requiredComponents) {
      if (this.shouldUseComponent(content, component.name) && !this.usesComponent(content, component.name)) {
        issues.push(this.createIssue(
          'missing_ui_component',
          'warning',
          `Should use ${component.name} from UI kit instead of custom implementation`,
          'ui_kit_compliance',
          file.path,
          `Import ${component.name} from "${component.path}"`
        ));
      }
    }
    
    // Check for proper Tailwind usage
    if (this.hasHardcodedStyles(content)) {
      issues.push(this.createIssue(
        'hardcoded_styles',
        'error',
        'Found hardcoded styles. Use Tailwind CSS classes and design tokens',
        'design_tokens',
        file.path,
        'Replace hardcoded styles with Tailwind classes'
      ));
    }
    
    // Check for brand token usage
    if (this.hasHardcodedColors(content)) {
      issues.push(this.createIssue(
        'hardcoded_colors',
        'error',
        'Found hardcoded colors. Use CSS variables from brand tokens',
        'brand_tokens',
        file.path,
        'Use CSS variables like --primary, --background, etc.'
      ));
    }
    
    // Check for Inter font usage
    if (this.hasNonInterFont(content)) {
      issues.push(this.createIssue(
        'wrong_font',
        'warning',
        'Should use Inter font family as defined in brand tokens',
        'typography',
        file.path,
        'Use font-sans class or Inter font family'
      ));
    }
    
    // Check for proper spacing (8px grid)
    if (this.hasNonGridSpacing(content)) {
      issues.push(this.createIssue(
        'non_grid_spacing',
        'warning',
        'Use 8px grid spacing (space-1, space-2, space-4, etc.)',
        'spacing_grid',
        file.path,
        'Use Tailwind spacing classes that follow 8px grid'
      ));
    }
    
    // Check for rounded-2xl preference
    if (this.hasNonPreferredRadius(content)) {
      issues.push(this.createIssue(
        'non_preferred_radius',
        'info',
        'Prefer rounded-2xl for cards and containers',
        'border_radius',
        file.path,
        'Use rounded-2xl for consistent brand appearance'
      ));
    }
    
    // Check for Framer Motion usage
    if (this.needsMotion(content) && !this.usesFramerMotion(content)) {
      issues.push(this.createIssue(
        'missing_motion',
        'warning',
        'Interactive elements should use Framer Motion for smooth animations',
        'animations',
        file.path,
        'Add motion.div or AnimatePresence for transitions'
      ));
    }
    
    // Check for accessibility
    issues.push(...this.checkAccessibility(content, file.path));
    
    // Check for loading/empty/error states
    issues.push(...this.checkStates(content, file.path));
    
    // Check for responsive design
    if (this.lacksResponsiveDesign(content)) {
      issues.push(this.createIssue(
        'not_responsive',
        'warning',
        'Component should be responsive using Tailwind breakpoints',
        'responsive_design',
        file.path,
        'Add responsive classes like md:, lg:, xl:'
      ));
    }
    
    return issues;
  }

  private async checkStyleBranding(file: any, context: RuleContext): Promise<Issue[]> {
    const issues: Issue[] = [];
    const content = file.content || '';
    
    // Check for CSS variables usage
    if (!this.usesCSSVariables(content)) {
      issues.push(this.createIssue(
        'no_css_variables',
        'error',
        'Styles should use CSS variables for theming',
        'css_variables',
        file.path,
        'Use var(--primary), var(--background), etc.'
      ));
    }
    
    // Check for theme support
    if (!this.supportsThemes(content)) {
      issues.push(this.createIssue(
        'no_theme_support',
        'warning',
        'Styles should support both light and dark themes',
        'theme_support',
        file.path,
        'Add .dark selector support'
      ));
    }
    
    return issues;
  }

  private async checkModuleCompliance(context: RuleContext): Promise<Issue[]> {
    const issues: Issue[] = [];
    
    // Check for consistent sidebar/header
    const hasLayout = context.files.some(f => 
      f.path.includes('layout') || f.path.includes('sidebar') || f.path.includes('header')
    );
    
    if (!hasLayout && context.module !== 'core') {
      issues.push(this.createIssue(
        'missing_layout',
        'warning',
        'Module should use consistent layout components',
        'layout_consistency',
        undefined,
        'Import and use Sidebar/Header components'
      ));
    }
    
    // Check for theme consistency
    const hasThemeSupport = context.files.some(f => 
      f.content?.includes('dark:') || f.content?.includes('theme')
    );
    
    if (!hasThemeSupport) {
      issues.push(this.createIssue(
        'no_theme_implementation',
        'info',
        'Module should support light/dark theme switching',
        'theme_consistency',
        undefined,
        'Add theme support with dark: classes'
      ));
    }
    
    return issues;
  }

  private checkAccessibility(content: string, filePath: string): Issue[] {
    const issues: Issue[] = [];
    
    // Check for ARIA labels
    if (this.hasInteractiveElements(content) && !this.hasAriaLabels(content)) {
      issues.push(this.createIssue(
        'missing_aria_labels',
        'error',
        'Interactive elements must have ARIA labels for accessibility',
        'accessibility',
        filePath,
        'Add aria-label, aria-labelledby, or aria-describedby'
      ));
    }
    
    // Check for semantic HTML
    if (this.hasNonSemanticHTML(content)) {
      issues.push(this.createIssue(
        'non_semantic_html',
        'warning',
        'Use semantic HTML elements (button, nav, main, section, etc.)',
        'semantic_html',
        filePath,
        'Replace div with semantic elements where appropriate'
      ));
    }
    
    // Check for keyboard navigation
    if (this.hasClickHandlers(content) && !this.hasKeyboardHandlers(content)) {
      issues.push(this.createIssue(
        'missing_keyboard_nav',
        'warning',
        'Clickable elements should support keyboard navigation',
        'keyboard_navigation',
        filePath,
        'Add onKeyDown handlers for Enter and Space keys'
      ));
    }
    
    return issues;
  }

  private checkStates(content: string, filePath: string): Issue[] {
    const issues: Issue[] = [];
    
    // Check for loading state
    if (this.hasAsyncOperations(content) && !this.hasLoadingState(content)) {
      issues.push(this.createIssue(
        'missing_loading_state',
        'warning',
        'Async operations should show loading state',
        'loading_states',
        filePath,
        'Add loading spinner or skeleton while data loads'
      ));
    }
    
    // Check for empty state
    if (this.hasDataLists(content) && !this.hasEmptyState(content)) {
      issues.push(this.createIssue(
        'missing_empty_state',
        'info',
        'Data lists should handle empty state gracefully',
        'empty_states',
        filePath,
        'Add EmptyState component when no data available'
      ));
    }
    
    // Check for error state
    if (this.hasErrorHandling(content) && !this.hasErrorState(content)) {
      issues.push(this.createIssue(
        'missing_error_state',
        'warning',
        'Error handling should include user-friendly error state',
        'error_states',
        filePath,
        'Add ErrorBoundary or error message display'
      ));
    }
    
    return issues;
  }

  private generateRecommendations(issues: Issue[]): string[] {
    const recommendations: string[] = [];
    
    if (issues.some(i => i.type === 'hardcoded_colors')) {
      recommendations.push('Migrate to CSS variables for consistent theming');
    }
    
    if (issues.some(i => i.type === 'missing_ui_component')) {
      recommendations.push('Use Shadcn/ui components from the design system');
    }
    
    if (issues.some(i => i.type === 'missing_motion')) {
      recommendations.push('Add Framer Motion for premium animations');
    }
    
    if (issues.some(i => i.rule === 'accessibility')) {
      recommendations.push('Improve accessibility with ARIA labels and semantic HTML');
    }
    
    if (issues.some(i => i.rule.includes('state'))) {
      recommendations.push('Implement loading, empty, and error states');
    }
    
    return recommendations;
  }

  // Helper methods for content analysis
  private shouldUseComponent(content: string, componentName: string): boolean {
    const patterns = {
      'Button': /(<button|onClick)/,
      'Card': /(card|panel|container)/i,
      'Input': /(<input|type=)/,
      'Select': /(select|dropdown|option)/i,
      'Dialog': /(modal|dialog|popup)/i,
    };
    
    return patterns[componentName as keyof typeof patterns]?.test(content) || false;
  }

  private usesComponent(content: string, componentName: string): boolean {
    return content.includes(`<${componentName}`) || content.includes(`import.*${componentName}`);
  }

  private hasHardcodedStyles(content: string): boolean {
    return /style=\{/.test(content) || /style="/.test(content);
  }

  private hasHardcodedColors(content: string): boolean {
    return /#[0-9a-fA-F]{3,6}|rgb\(|rgba\(|hsl\(/.test(content);
  }

  private hasNonInterFont(content: string): boolean {
    return /font-family.*(?!Inter)/.test(content) && !content.includes('font-sans');
  }

  private hasNonGridSpacing(content: string): boolean {
    // Check for non-standard spacing values
    return /space-[^1-9]|p-[^1-9]|m-[^1-9]/.test(content);
  }

  private hasNonPreferredRadius(content: string): boolean {
    return /rounded-(?!2xl|full)/.test(content);
  }

  private needsMotion(content: string): boolean {
    return /transition|animate|hover:|focus:/.test(content);
  }

  private usesFramerMotion(content: string): boolean {
    return /motion\.|AnimatePresence|framer-motion/.test(content);
  }

  private lacksResponsiveDesign(content: string): boolean {
    return !/(?:sm:|md:|lg:|xl:|2xl:)/.test(content);
  }

  private usesCSSVariables(content: string): boolean {
    return /var\(--/.test(content);
  }

  private supportsThemes(content: string): boolean {
    return /\.dark|dark:/.test(content);
  }

  private hasInteractiveElements(content: string): boolean {
    return /onClick|onSubmit|button|input|select/.test(content);
  }

  private hasAriaLabels(content: string): boolean {
    return /aria-label|aria-labelledby|aria-describedby/.test(content);
  }

  private hasNonSemanticHTML(content: string): boolean {
    return /<div.*onClick|<span.*onClick/.test(content);
  }

  private hasClickHandlers(content: string): boolean {
    return /onClick/.test(content);
  }

  private hasKeyboardHandlers(content: string): boolean {
    return /onKeyDown|onKeyPress/.test(content);
  }

  private hasAsyncOperations(content: string): boolean {
    return /useEffect|useSWR|fetch|async/.test(content);
  }

  private hasLoadingState(content: string): boolean {
    return /loading|isLoading|LoadingSpinner|Skeleton/.test(content);
  }

  private hasDataLists(content: string): boolean {
    return /\.map\(|\.filter\(|\.length/.test(content);
  }

  private hasEmptyState(content: string): boolean {
    return /EmptyState|empty|no.*data|length.*===.*0/.test(content);
  }

  private hasErrorHandling(content: string): boolean {
    return /try.*catch|\.catch\(|error/.test(content);
  }

  private hasErrorState(content: string): boolean {
    return /ErrorBoundary|error.*message|error.*state/.test(content);
  }
}
