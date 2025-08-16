/**
 * Console Reporter
 * Reports rule agent results to console for build logs
 */

import { BaseReporter, RuleAgentResult, RuleContext } from '../types';

export class ConsoleReporter extends BaseReporter {
  name = 'Console Reporter';

  async report(result: RuleAgentResult, context: RuleContext): Promise<void> {
    console.log('\n' + '='.repeat(80));
    console.log('🛡️  ECOMMIND RULE AGENT REPORT');
    console.log('='.repeat(80));
    
    // Header information
    console.log(`📦 Module: ${context.module}`);
    console.log(`📅 Timestamp: ${context.timestamp}`);
    console.log(`📊 Overall Score: ${result.overallScore}/100`);
    console.log(`🚦 Gate Status: ${this.getGateStatusIcon(result.gateStatus)} ${result.gateStatus.toUpperCase()}`);
    console.log('');
    
    // Summary
    console.log('📋 SUMMARY');
    console.log('-'.repeat(40));
    console.log(`Total Issues: ${result.summary.totalIssues}`);
    console.log(`🔴 Errors: ${result.summary.errorCount}`);
    console.log(`🟡 Warnings: ${result.summary.warningCount}`);
    console.log(`🔵 Info: ${result.summary.infoCount}`);
    console.log('');
    
    // Check results
    console.log('🔍 CHECK RESULTS');
    console.log('-'.repeat(40));
    
    for (const check of result.checks) {
      const statusIcon = check.passed ? '✅' : '❌';
      const scoreColor = this.getScoreColor(check.score);
      
      console.log(`${statusIcon} ${check.checkName}`);
      console.log(`   Score: ${scoreColor}${check.score}/100\x1b[0m`);
      console.log(`   Issues: ${check.issues.length}`);
      
      if (check.issues.length > 0) {
        // Group issues by severity
        const errors = check.issues.filter(i => i.severity === 'error');
        const warnings = check.issues.filter(i => i.severity === 'warning');
        const infos = check.issues.filter(i => i.severity === 'info');
        
        if (errors.length > 0) {
          console.log(`   🔴 Errors (${errors.length}):`);
          errors.forEach(issue => {
            console.log(`      • ${issue.message}`);
            if (issue.file) {
              console.log(`        📁 ${issue.file}`);
            }
            if (issue.suggestion) {
              console.log(`        💡 ${issue.suggestion}`);
            }
          });
        }
        
        if (warnings.length > 0) {
          console.log(`   🟡 Warnings (${warnings.length}):`);
          warnings.forEach(issue => {
            console.log(`      • ${issue.message}`);
            if (issue.file) {
              console.log(`        📁 ${issue.file}`);
            }
          });
        }
        
        if (infos.length > 0 && process.env.NODE_ENV === 'development') {
          console.log(`   🔵 Info (${infos.length}):`);
          infos.forEach(issue => {
            console.log(`      • ${issue.message}`);
          });
        }
      }
      
      console.log('');
    }
    
    // Recommendations
    if (result.recommendations.length > 0) {
      console.log('💡 RECOMMENDATIONS');
      console.log('-'.repeat(40));
      result.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
      console.log('');
    }
    
    // Files analyzed
    console.log('📁 FILES ANALYZED');
    console.log('-'.repeat(40));
    console.log(`Total Files: ${context.files.length}`);
    
    const filesByType = context.files.reduce((acc, file) => {
      acc[file.type] = (acc[file.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(filesByType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
    console.log('');
    
    // Routes analyzed
    if (context.routes.length > 0) {
      console.log('🛣️  ROUTES ANALYZED');
      console.log('-'.repeat(40));
      context.routes.forEach(route => {
        const securityIcons = [
          route.auth ? '🔐' : '🔓',
          route.rls ? '🛡️' : '⚠️',
          route.validation ? '✅' : '❌',
          route.rateLimit ? '🚦' : '⏰'
        ].join(' ');
        
        console.log(`  ${route.method} ${route.path} ${securityIcons}`);
      });
      console.log('');
    }
    
    // Features
    if (context.features.length > 0) {
      console.log('🚀 FEATURES');
      console.log('-'.repeat(40));
      context.features.forEach(feature => {
        console.log(`  ✨ ${feature}`);
      });
      console.log('');
    }
    
    // Final status
    console.log('🎯 FINAL STATUS');
    console.log('-'.repeat(40));
    
    if (result.gateStatus === 'pass') {
      console.log('🎉 \x1b[32mALL CHECKS PASSED! Module meets quality standards.\x1b[0m');
    } else if (result.gateStatus === 'warning') {
      console.log('⚠️  \x1b[33mWARNINGS DETECTED. Consider addressing issues before deployment.\x1b[0m');
    } else {
      console.log('🚨 \x1b[31mCRITICAL ISSUES DETECTED. Must fix errors before proceeding.\x1b[0m');
    }
    
    console.log('='.repeat(80));
    console.log('');
  }

  private getGateStatusIcon(status: string): string {
    switch (status) {
      case 'pass':
        return '🟢';
      case 'warning':
        return '🟡';
      case 'fail':
        return '🔴';
      default:
        return '⚪';
    }
  }

  private getScoreColor(score: number): string {
    if (score >= 90) return '\x1b[32m'; // Green
    if (score >= 80) return '\x1b[33m'; // Yellow
    if (score >= 70) return '\x1b[35m'; // Magenta
    return '\x1b[31m'; // Red
  }
}
