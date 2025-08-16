/**
 * UI Notice Reporter
 * Reports rule agent results to UI banner for PR reviews
 */

import { BaseReporter, RuleAgentResult, RuleContext } from '../types';

export class UINoticeReporter extends BaseReporter {
  name = 'UI Notice Reporter';

  async report(result: RuleAgentResult, context: RuleContext): Promise<void> {
    // Generate HTML report for UI display
    const htmlReport = this.generateHTMLReport(result, context);
    
    // Store report in a way that can be accessed by UI
    // This could be localStorage, sessionStorage, or API call
    if (typeof window !== 'undefined') {
      this.storeUIReport(htmlReport, context);
    } else {
      // Server-side: could write to file or send to API
      this.storeServerReport(htmlReport, context);
    }
  }

  private generateHTMLReport(result: RuleAgentResult, context: RuleContext): string {
    const statusClass = this.getStatusClass(result.gateStatus);
    const statusIcon = this.getStatusIcon(result.gateStatus);
    
    return `
      <div class="rule-agent-report ${statusClass}" data-module="${context.module}">
        <div class="report-header">
          <div class="status-badge">
            <span class="status-icon">${statusIcon}</span>
            <span class="status-text">${result.gateStatus.toUpperCase()}</span>
          </div>
          <div class="module-info">
            <h3>🛡️ Rule Agent Report - ${context.module}</h3>
            <div class="score">Score: ${result.overallScore}/100</div>
          </div>
        </div>
        
        <div class="report-summary">
          <div class="summary-stats">
            <span class="stat error">🔴 ${result.summary.errorCount}</span>
            <span class="stat warning">🟡 ${result.summary.warningCount}</span>
            <span class="stat info">🔵 ${result.summary.infoCount}</span>
          </div>
        </div>
        
        ${this.generateChecksHTML(result.checks)}
        
        ${result.recommendations.length > 0 ? this.generateRecommendationsHTML(result.recommendations) : ''}
        
        <div class="report-footer">
          <small>Generated at ${context.timestamp}</small>
          <button class="dismiss-btn" onclick="this.closest('.rule-agent-report').remove()">
            Dismiss
          </button>
        </div>
      </div>
      
      <style>
        .rule-agent-report {
          position: fixed;
          top: 20px;
          right: 20px;
          max-width: 400px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          border-left: 4px solid;
          z-index: 9999;
          font-family: Inter, system-ui, sans-serif;
          font-size: 14px;
          line-height: 1.5;
        }
        
        .rule-agent-report.pass {
          border-left-color: #10b981;
        }
        
        .rule-agent-report.warning {
          border-left-color: #f59e0b;
        }
        
        .rule-agent-report.fail {
          border-left-color: #ef4444;
        }
        
        .report-header {
          padding: 16px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .status-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .status-badge.pass {
          background: #dcfce7;
          color: #166534;
        }
        
        .status-badge.warning {
          background: #fef3c7;
          color: #92400e;
        }
        
        .status-badge.fail {
          background: #fee2e2;
          color: #991b1b;
        }
        
        .module-info h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #111827;
        }
        
        .score {
          font-size: 12px;
          color: #6b7280;
          margin-top: 2px;
        }
        
        .report-summary {
          padding: 12px 16px;
          background: #f9fafb;
        }
        
        .summary-stats {
          display: flex;
          gap: 16px;
        }
        
        .stat {
          font-size: 12px;
          font-weight: 500;
        }
        
        .checks-list {
          padding: 16px;
        }
        
        .check-item {
          margin-bottom: 12px;
          padding: 8px;
          border-radius: 6px;
          background: #f9fafb;
        }
        
        .check-header {
          display: flex;
          align-items: center;
          justify-content: between;
          margin-bottom: 4px;
        }
        
        .check-name {
          font-weight: 500;
          color: #111827;
        }
        
        .check-score {
          font-size: 12px;
          color: #6b7280;
        }
        
        .check-issues {
          font-size: 12px;
          color: #6b7280;
          margin-top: 4px;
        }
        
        .recommendations {
          padding: 16px;
          background: #eff6ff;
          border-top: 1px solid #e5e7eb;
        }
        
        .recommendations h4 {
          margin: 0 0 8px 0;
          font-size: 14px;
          font-weight: 600;
          color: #1e40af;
        }
        
        .recommendations ul {
          margin: 0;
          padding-left: 16px;
          font-size: 12px;
          color: #374151;
        }
        
        .recommendations li {
          margin-bottom: 4px;
        }
        
        .report-footer {
          padding: 12px 16px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f9fafb;
          border-radius: 0 0 12px 12px;
        }
        
        .dismiss-btn {
          background: #6b7280;
          color: white;
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
        }
        
        .dismiss-btn:hover {
          background: #4b5563;
        }
        
        @media (max-width: 640px) {
          .rule-agent-report {
            position: relative;
            top: auto;
            right: auto;
            max-width: none;
            margin: 16px;
            border-radius: 8px;
          }
        }
      </style>
    `;
  }

  private generateChecksHTML(checks: any[]): string {
    if (checks.length === 0) return '';
    
    const checksHTML = checks.map(check => {
      const statusIcon = check.passed ? '✅' : '❌';
      const issueCount = check.issues.length;
      
      return `
        <div class="check-item">
          <div class="check-header">
            <span class="check-name">${statusIcon} ${check.checkName}</span>
            <span class="check-score">${check.score}/100</span>
          </div>
          ${issueCount > 0 ? `<div class="check-issues">${issueCount} issues found</div>` : ''}
        </div>
      `;
    }).join('');
    
    return `
      <div class="checks-list">
        ${checksHTML}
      </div>
    `;
  }

  private generateRecommendationsHTML(recommendations: string[]): string {
    const recommendationsHTML = recommendations.map(rec => `<li>${rec}</li>`).join('');
    
    return `
      <div class="recommendations">
        <h4>💡 Recommendations</h4>
        <ul>
          ${recommendationsHTML}
        </ul>
      </div>
    `;
  }

  private getStatusClass(status: string): string {
    return status; // 'pass', 'warning', 'fail'
  }

  private getStatusIcon(status: string): string {
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

  private storeUIReport(htmlReport: string, context: RuleContext): void {
    // Store in sessionStorage for current session
    const reportKey = `rule-agent-report-${context.module}-${Date.now()}`;
    sessionStorage.setItem(reportKey, htmlReport);
    
    // Trigger custom event for UI to listen to
    window.dispatchEvent(new CustomEvent('rule-agent-report', {
      detail: {
        module: context.module,
        reportKey,
        htmlReport
      }
    }));
    
    // Auto-display the report
    this.displayReport(htmlReport);
  }

  private storeServerReport(htmlReport: string, context: RuleContext): void {
    // In server environment, could write to file or send to API
    console.log(`[UINoticeReporter] Report generated for ${context.module}`);
    
    // Could write to a file that the UI can read
    // fs.writeFileSync(`/tmp/rule-agent-${context.module}.html`, htmlReport);
  }

  private displayReport(htmlReport: string): void {
    if (typeof document === 'undefined') return;
    
    // Remove any existing reports
    const existingReports = document.querySelectorAll('.rule-agent-report');
    existingReports.forEach(report => report.remove());
    
    // Create and insert new report
    const reportContainer = document.createElement('div');
    reportContainer.innerHTML = htmlReport;
    
    // Insert into body
    document.body.appendChild(reportContainer.firstElementChild!);
    
    // Auto-dismiss after 30 seconds for non-critical issues
    const reportElement = document.querySelector('.rule-agent-report');
    if (reportElement && !reportElement.classList.contains('fail')) {
      setTimeout(() => {
        if (reportElement.parentNode) {
          reportElement.remove();
        }
      }, 30000);
    }
  }
}
