/**
 * Rule Agent - Example Usage
 * Demonstrates how to use the Rule Agent in different scenarios
 */

import { 
  runRuleAgent, 
  createFileInfo, 
  createRouteInfo, 
  RuleAgent,
  applyPresetConfig 
} from './index';

// Example 1: Basic usage for a new feature
export async function exampleBasicUsage() {
  console.log('🔍 Example 1: Basic Rule Agent Usage');
  
  const result = await runRuleAgent({
    module: 'chat-360',
    files: [
      createFileInfo({
        path: 'src/features/chat/components/ChatInterface.tsx',
        type: 'component',
        content: `
          'use client';
          import { useState } from 'react';
          import { Button } from '@/components/ui/button';
          import { Card } from '@/components/ui/card';
          
          export function ChatInterface() {
            const [message, setMessage] = useState('');
            
            return (
              <Card className="p-6 rounded-2xl">
                <Button onClick={() => console.log('Send')}>
                  Send Message
                </Button>
              </Card>
            );
          }
        `,
        dependencies: ['react', '@/components/ui/button', '@/components/ui/card'],
        exports: ['ChatInterface'],
        imports: ['useState', 'Button', 'Card']
      }),
      
      createFileInfo({
        path: 'src/app/api/chat/messages/route.ts',
        type: 'api',
        content: `
          import { NextRequest, NextResponse } from 'next/server';
          import { z } from 'zod';
          import { validateApiAccess } from '@/app/api/_helpers/auth';
          
          const MessageSchema = z.object({
            content: z.string().min(1),
            threadId: z.string().uuid()
          });
          
          export async function POST(request: NextRequest) {
            const { context, error } = await validateApiAccess();
            if (error) return error;
            
            const body = await request.json();
            const { content, threadId } = MessageSchema.parse(body);
            
            // RLS enforced query
            const { data } = await supabase
              .from('chat_messages')
              .insert({ content, thread_id: threadId, company_id: context.companyId });
            
            return NextResponse.json({ success: true, data });
          }
        `,
        dependencies: ['next/server', 'zod', '@/app/api/_helpers/auth'],
        exports: ['POST'],
        imports: ['NextRequest', 'NextResponse', 'z', 'validateApiAccess']
      })
    ],
    
    routes: [
      createRouteInfo({
        path: '/api/chat/messages',
        method: 'POST',
        type: 'api',
        auth: true,
        rls: true,
        validation: true,
        rateLimit: false
      })
    ],
    
    features: ['UX premium', 'RLS', 'SWR', 'Events', 'Missions', 'IA'],
    brandTokens: '/styles/tokens.css'
  });
  
  console.log('✅ Gate Status:', result.gateStatus);
  console.log('📊 Overall Score:', result.overallScore);
  console.log('🔍 Total Issues:', result.summary.totalIssues);
  
  return result;
}

// Example 2: Advanced usage with custom configuration
export async function exampleAdvancedUsage() {
  console.log('🔍 Example 2: Advanced Rule Agent Usage');
  
  // Apply strict configuration for production
  const agent = applyPresetConfig('strict');
  
  // Create detailed context
  const context = RuleAgent.createContext({
    module: 'market-intelligence',
    files: [
      createFileInfo({
        path: 'src/features/market/components/calendar-view.tsx',
        type: 'component',
        content: `
          import { motion } from 'framer-motion';
          import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
          import { Badge } from '@/components/ui/badge';
          import { Calendar, TrendingUp } from 'lucide-react';
          
          interface CalendarViewProps {
            events: MarketEvent[];
            onEventClick: (event: MarketEvent) => void;
          }
          
          export function CalendarView({ events, onEventClick }: CalendarViewProps) {
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {events.map((event) => (
                  <Card 
                    key={event.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow rounded-2xl"
                    onClick={() => onEventClick(event)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Calendar className="h-5 w-5 text-primary" />
                        <Badge variant={event.importance === 'high' ? 'default' : 'secondary'}>
                          {event.importance}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        <span>{event.channel}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            );
          }
        `,
        dependencies: ['framer-motion', '@/components/ui/card', '@/components/ui/badge', 'lucide-react'],
        exports: ['CalendarView'],
        imports: ['motion', 'Card', 'CardContent', 'CardHeader', 'CardTitle', 'Badge', 'Calendar', 'TrendingUp']
      }),
      
      createFileInfo({
        path: 'src/features/market/hooks/use-market-events.ts',
        type: 'hook',
        content: `
          import useSWR from 'swr';
          import { MarketEvent } from '../types';
          
          interface UseMarketEventsParams {
            from?: string;
            to?: string;
            channel?: string;
            niche?: string;
          }
          
          const fetcher = async (url: string): Promise<MarketEvent[]> => {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch events');
            return response.json();
          };
          
          export function useMarketEvents(params: UseMarketEventsParams = {}) {
            const searchParams = new URLSearchParams();
            
            if (params.from) searchParams.set('from', params.from);
            if (params.to) searchParams.set('to', params.to);
            if (params.channel) searchParams.set('channel', params.channel);
            if (params.niche) searchParams.set('niche', params.niche);
            
            const url = \`/api/market/events?\${searchParams.toString()}\`;
            
            const { data, error, mutate, isLoading } = useSWR<MarketEvent[]>(
              url,
              fetcher,
              {
                refreshInterval: 5 * 60 * 1000, // 5 minutes
                revalidateOnFocus: true,
                errorRetryCount: 3
              }
            );
            
            return {
              events: data || [],
              error,
              isLoading,
              mutate
            };
          }
        `,
        dependencies: ['swr'],
        exports: ['useMarketEvents'],
        imports: ['useSWR']
      })
    ],
    
    routes: [
      createRouteInfo({
        path: '/api/market/events',
        method: 'GET',
        type: 'api',
        auth: true,
        rls: true,
        validation: true,
        rateLimit: true
      }),
      
      createRouteInfo({
        path: '/api/market/events/curate',
        method: 'POST',
        type: 'api',
        auth: true,
        rls: true,
        validation: true,
        rateLimit: true
      })
    ],
    
    features: [
      'UX premium',
      'Framer Motion',
      'Shadcn UI',
      'SWR',
      'TypeScript strict',
      'RLS',
      'Event Bus',
      'Missions IA'
    ]
  });
  
  const result = await agent.execute(context);
  
  console.log('✅ Advanced Analysis Complete');
  console.log('📊 Branding Score:', result.checks.find(c => c.checkName.includes('Branding'))?.score);
  console.log('🏗️ Architecture Score:', result.checks.find(c => c.checkName.includes('Architecture'))?.score);
  console.log('🔗 Integration Score:', result.checks.find(c => c.checkName.includes('Integration'))?.score);
  
  return result;
}

// Example 3: CI/CD integration
export async function exampleCIUsage() {
  console.log('🔍 Example 3: CI/CD Rule Agent Usage');
  
  // Apply CI configuration
  const agent = applyPresetConfig('ci');
  
  // Simulate files from git diff
  const changedFiles = [
    'src/features/reports/components/sales-report.tsx',
    'src/app/api/reports/sales/route.ts',
    'src/features/reports/hooks/use-sales-report.ts'
  ];
  
  const files = changedFiles.map(filePath => {
    const type = filePath.includes('/api/') ? 'api' : 
                 filePath.includes('/components/') ? 'component' :
                 filePath.includes('/hooks/') ? 'hook' : 'util';
    
    return createFileInfo({
      path: filePath,
      type: type as any,
      content: '// Simulated file content for CI',
      dependencies: ['react', 'next'],
      exports: ['default'],
      imports: ['React']
    });
  });
  
  const result = await runRuleAgent({
    module: 'reports',
    files,
    routes: [
      createRouteInfo({
        path: '/api/reports/sales',
        method: 'GET',
        type: 'api',
        auth: true,
        rls: true,
        validation: true,
        rateLimit: true
      })
    ],
    features: ['Reports', 'Analytics', 'Export']
  });
  
  // CI/CD decision logic
  if (result.gateStatus === 'fail') {
    console.log('🚨 CI/CD: BLOCKING DEPLOYMENT - Critical issues found');
    process.exit(1);
  } else if (result.gateStatus === 'warning') {
    console.log('⚠️ CI/CD: PROCEEDING WITH WARNINGS - Review recommended');
  } else {
    console.log('✅ CI/CD: ALL CHECKS PASSED - Ready for deployment');
  }
  
  return result;
}

// Example 4: Development mode usage
export async function exampleDevelopmentUsage() {
  console.log('🔍 Example 4: Development Mode Usage');
  
  // Apply relaxed configuration for development
  const agent = applyPresetConfig('development');
  
  const result = await runRuleAgent({
    module: 'chat-360',
    files: [
      createFileInfo({
        path: 'src/features/chat/components/MessageInput.tsx',
        type: 'component',
        content: `
          // Quick prototype - not production ready
          export function MessageInput() {
            return <input type="text" />;
          }
        `
      })
    ],
    features: ['Prototype', 'WIP']
  });
  
  console.log('🔧 Development Analysis:');
  console.log('- Errors:', result.summary.errorCount);
  console.log('- Warnings:', result.summary.warningCount);
  console.log('- Recommendations:', result.recommendations.length);
  
  return result;
}

// Run all examples
export async function runAllExamples() {
  console.log('🚀 Running All Rule Agent Examples\n');
  
  try {
    await exampleBasicUsage();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await exampleAdvancedUsage();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await exampleCIUsage();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await exampleDevelopmentUsage();
    console.log('\n' + '='.repeat(50) + '\n');
    
    console.log('✅ All examples completed successfully!');
  } catch (error) {
    console.error('❌ Example execution failed:', error);
  }
}

// Export for testing
export default {
  exampleBasicUsage,
  exampleAdvancedUsage,
  exampleCIUsage,
  exampleDevelopmentUsage,
  runAllExamples
};
