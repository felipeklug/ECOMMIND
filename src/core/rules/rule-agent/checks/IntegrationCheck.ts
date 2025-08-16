/**
 * Integration Check
 * Validates module integration and workflow compliance
 */

import { BaseCheck, CheckResult, RuleContext, Issue } from '../types';
import eventBusContract from '../fixtures/event-bus-contract.json';

export class IntegrationCheck extends BaseCheck {
  name = 'Integration & Workflows';
  description = 'Validates module integration, event bus usage, and workflow patterns';

  async run(context: RuleContext): Promise<CheckResult> {
    const issues: Issue[] = [];
    
    // Check event bus integration
    issues.push(...await this.checkEventBusIntegration(context));
    
    // Check missions integration
    issues.push(...await this.checkMissionsIntegration(context));
    
    // Check API integration patterns
    issues.push(...await this.checkAPIIntegration(context));
    
    // Check UI kit reusability
    issues.push(...await this.checkUIKitUsage(context));
    
    // Check workflow patterns
    issues.push(...await this.checkWorkflowPatterns(context));
    
    const score = this.calculateScore(issues);
    const passed = score >= 75 && !issues.some(i => i.severity === 'error');
    
    return {
      checkName: this.name,
      passed,
      severity: passed ? 'info' : 'warning',
      issues,
      score,
      recommendations: this.generateRecommendations(issues),
    };
  }

  private async checkEventBusIntegration(context: RuleContext): Promise<Issue[]> {
    const issues: Issue[] = [];
    
    // Check if module emits events
    const hasEventEmission = context.files.some(f => 
      this.emitsEvents(f.content || '', context.module)
    );
    
    if (!hasEventEmission && this.shouldEmitEvents(context.module)) {
      issues.push(this.createIssue(
        'missing_event_emission',
        'warning',
        `Module ${context.module} should emit events to event bus`,
        'event_bus_integration',
        undefined,
        'Add eventBus.emit() calls for key module actions'
      ));
    }
    
    // Check if module listens to relevant events
    const hasEventListening = context.files.some(f => 
      this.listensToEvents(f.content || '')
    );
    
    if (!hasEventListening && this.shouldListenToEvents(context.module)) {
      issues.push(this.createIssue(
        'missing_event_listening',
        'info',
        `Module ${context.module} could benefit from listening to other module events`,
        'event_bus_integration',
        undefined,
        'Add eventBus.on() listeners for relevant events'
      ));
    }
    
    // Check for proper event payload structure
    for (const file of context.files) {
      const content = file.content || '';
      if (this.hasEventEmission(content)) {
        const invalidPayloads = this.findInvalidEventPayloads(content);
        for (const payload of invalidPayloads) {
          issues.push(this.createIssue(
            'invalid_event_payload',
            'warning',
            `Event payload doesn't match contract: ${payload}`,
            'event_payload_validation',
            file.path,
            'Ensure event payload matches the event bus contract'
          ));
        }
      }
    }
    
    return issues;
  }

  private async checkMissionsIntegration(context: RuleContext): Promise<Issue[]> {
    const issues: Issue[] = [];
    
    // Check for mission creation integration
    const hasMissionCreation = context.files.some(f => 
      this.createsMissions(f.content || '')
    );
    
    if (!hasMissionCreation && this.shouldCreateMissions(context.module)) {
      issues.push(this.createIssue(
        'missing_mission_creation',
        'info',
        `Module ${context.module} could create missions for actionable insights`,
        'missions_integration',
        undefined,
        'Add "Criar Missão" buttons for insights and recommendations'
      ));
    }
    
    // Check for proper mission payload structure
    for (const file of context.files) {
      const content = file.content || '';
      if (this.createsMissions(content)) {
        if (!this.hasProperMissionPayload(content)) {
          issues.push(this.createIssue(
            'improper_mission_payload',
            'warning',
            'Mission creation should include proper payload structure',
            'mission_payload',
            file.path,
            'Include module, title, summary, priority, tags, and payload fields'
          ));
        }
      }
    }
    
    return issues;
  }

  private async checkAPIIntegration(context: RuleContext): Promise<Issue[]> {
    const issues: Issue[] = [];
    
    // Check for consistent API patterns
    const apiFiles = context.files.filter(f => f.type === 'api');
    
    for (const file of apiFiles) {
      const content = file.content || '';
      
      // Check for consistent response format
      if (!this.hasConsistentResponseFormat(content)) {
        issues.push(this.createIssue(
          'inconsistent_api_response',
          'warning',
          'API should return consistent response format',
          'api_consistency',
          file.path,
          'Use NextResponse.json() with consistent structure'
        ));
      }
      
      // Check for proper error responses
      if (!this.hasProperErrorResponses(content)) {
        issues.push(this.createIssue(
          'poor_error_responses',
          'warning',
          'API should return proper error responses with status codes',
          'api_error_handling',
          file.path,
          'Return appropriate HTTP status codes and error messages'
        ));
      }
    }
    
    // Check for API documentation
    const hasAPIDocumentation = context.files.some(f => 
      f.path.includes('README') && this.hasAPIDocumentation(f.content || '')
    );
    
    if (apiFiles.length > 0 && !hasAPIDocumentation) {
      issues.push(this.createIssue(
        'missing_api_documentation',
        'info',
        'Module with APIs should include documentation',
        'api_documentation',
        undefined,
        'Add API endpoint documentation to README'
      ));
    }
    
    return issues;
  }

  private async checkUIKitUsage(context: RuleContext): Promise<Issue[]> {
    const issues: Issue[] = [];
    
    // Check for UI kit component reuse
    const componentFiles = context.files.filter(f => f.type === 'component');
    
    for (const file of componentFiles) {
      const content = file.content || '';
      
      // Check for custom implementations of existing UI kit components
      if (this.hasCustomUIImplementation(content)) {
        issues.push(this.createIssue(
          'custom_ui_implementation',
          'warning',
          'Avoid custom implementations of existing UI kit components',
          'ui_kit_reuse',
          file.path,
          'Use existing UI kit components instead of custom implementations'
        ));
      }
      
      // Check for consistent component patterns
      if (!this.followsComponentPatterns(content)) {
        issues.push(this.createIssue(
          'inconsistent_component_pattern',
          'info',
          'Component should follow established patterns',
          'component_patterns',
          file.path,
          'Follow forwardRef, proper props typing, and export patterns'
        ));
      }
    }
    
    return issues;
  }

  private async checkWorkflowPatterns(context: RuleContext): Promise<Issue[]> {
    const issues: Issue[] = [];
    
    // Check for proper data flow patterns
    const hasProperDataFlow = context.files.some(f => 
      this.hasProperDataFlow(f.content || '')
    );
    
    if (!hasProperDataFlow) {
      issues.push(this.createIssue(
        'poor_data_flow',
        'info',
        'Module should follow proper data flow patterns (SWR, state management)',
        'data_flow_patterns',
        undefined,
        'Use SWR for server state, useState for local state'
      ));
    }
    
    // Check for proper loading states
    const hasLoadingStates = context.files.some(f => 
      this.hasLoadingStates(f.content || '')
    );
    
    if (!hasLoadingStates && this.needsLoadingStates(context)) {
      issues.push(this.createIssue(
        'missing_loading_states',
        'warning',
        'Module should implement loading states for better UX',
        'loading_states',
        undefined,
        'Add loading spinners, skeletons, or progress indicators'
      ));
    }
    
    // Check for error boundaries
    const hasErrorBoundaries = context.files.some(f => 
      this.hasErrorBoundaries(f.content || '')
    );
    
    if (!hasErrorBoundaries && this.needsErrorBoundaries(context)) {
      issues.push(this.createIssue(
        'missing_error_boundaries',
        'info',
        'Module should implement error boundaries for robustness',
        'error_boundaries',
        undefined,
        'Add ErrorBoundary components around error-prone sections'
      ));
    }
    
    return issues;
  }

  private generateRecommendations(issues: Issue[]): string[] {
    const recommendations: string[] = [];
    
    if (issues.some(i => i.rule === 'event_bus_integration')) {
      recommendations.push('Integrate with event bus for module communication');
    }
    
    if (issues.some(i => i.rule === 'missions_integration')) {
      recommendations.push('Add mission creation for actionable insights');
    }
    
    if (issues.some(i => i.rule === 'api_consistency')) {
      recommendations.push('Ensure consistent API response formats and error handling');
    }
    
    if (issues.some(i => i.rule === 'ui_kit_reuse')) {
      recommendations.push('Maximize UI kit component reuse for consistency');
    }
    
    if (issues.some(i => i.rule.includes('states'))) {
      recommendations.push('Implement proper loading, empty, and error states');
    }
    
    return recommendations;
  }

  // Helper methods for content analysis
  private emitsEvents(content: string, module: string): boolean {
    return /eventBus\.emit|emit\(/.test(content);
  }

  private shouldEmitEvents(module: string): boolean {
    const eventEmittingModules = ['chat', 'missions', 'market', 'planning', 'reports'];
    return eventEmittingModules.includes(module);
  }

  private listensToEvents(content: string): boolean {
    return /eventBus\.on|eventBus\.subscribe|\.on\(/.test(content);
  }

  private shouldListenToEvents(module: string): boolean {
    const eventListeningModules = ['missions', 'reports', 'planning'];
    return eventListeningModules.includes(module);
  }

  private hasEventEmission(content: string): boolean {
    return /eventBus\.emit|emit\(/.test(content);
  }

  private findInvalidEventPayloads(content: string): string[] {
    // This would need more sophisticated parsing to validate against the contract
    // For now, return empty array as placeholder
    return [];
  }

  private createsMissions(content: string): boolean {
    return /\/api\/missions\/create|createMission|handleCreateMission/.test(content);
  }

  private shouldCreateMissions(module: string): boolean {
    const missionCreatingModules = ['reports', 'market', 'chat'];
    return missionCreatingModules.includes(module);
  }

  private hasProperMissionPayload(content: string): boolean {
    return /module.*title.*summary.*priority.*tags/.test(content.replace(/\s/g, ''));
  }

  private hasConsistentResponseFormat(content: string): boolean {
    return /NextResponse\.json/.test(content);
  }

  private hasProperErrorResponses(content: string): boolean {
    return /status:\s*[4-5]\d\d/.test(content);
  }

  private hasAPIDocumentation(content: string): boolean {
    return /API|endpoint|GET|POST|PUT|DELETE/.test(content);
  }

  private hasCustomUIImplementation(content: string): boolean {
    // Check for custom button, input, card implementations
    return /className.*button|className.*input|className.*card/.test(content) &&
           !/import.*Button|import.*Input|import.*Card/.test(content);
  }

  private followsComponentPatterns(content: string): boolean {
    return /forwardRef|interface.*Props|export/.test(content);
  }

  private hasProperDataFlow(content: string): boolean {
    return /useSWR|useState|useEffect/.test(content);
  }

  private hasLoadingStates(content: string): boolean {
    return /loading|isLoading|LoadingSpinner|Skeleton/.test(content);
  }

  private needsLoadingStates(context: RuleContext): boolean {
    return context.files.some(f => /useSWR|fetch|async/.test(f.content || ''));
  }

  private hasErrorBoundaries(content: string): boolean {
    return /ErrorBoundary|componentDidCatch|error.*boundary/.test(content);
  }

  private needsErrorBoundaries(context: RuleContext): boolean {
    return context.files.some(f => /async|fetch|api/.test(f.content || ''));
  }
}
