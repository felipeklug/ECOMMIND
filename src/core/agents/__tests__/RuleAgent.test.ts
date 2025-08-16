/**
 * Rule Agent Tests
 * Testa validação dos 3 prompts fundamentais
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import RuleAgent, { assertAllRules } from '../RuleAgent';

// Mock do sistema de arquivos
vi.mock('fs');
const mockFs = vi.mocked(fs);

// Mock do logger
vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }),
}));

describe('RuleAgent', () => {
  let agent: RuleAgent;

  beforeEach(() => {
    agent = new RuleAgent();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('UX Rules Validation', () => {
    it('should pass when brand tokens are present', async () => {
      // Mock globals.css with brand tokens
      mockFs.existsSync.mockImplementation((path: any) => {
        return path.includes('globals.css');
      });
      
      mockFs.readFileSync.mockImplementation((path: any) => {
        if (path.includes('globals.css')) {
          return `
            :root {
              --color-primary: #000;
              --color-secondary: #fff;
            }
            @theme inline {
              --color-background: var(--background);
            }
          `;
        }
        return '';
      });

      const result = await agent.assertAllRules({ pr: 'test-pr' });
      
      const brandTokenResult = result.categories.ux.find(r => r.message.includes('Brand Tokens'));
      expect(brandTokenResult?.passed).toBe(true);
    });

    it('should fail when brand tokens are missing', async () => {
      // Mock globals.css without brand tokens
      mockFs.existsSync.mockImplementation((path: any) => {
        return path.includes('globals.css');
      });
      
      mockFs.readFileSync.mockImplementation(() => {
        return 'body { margin: 0; }'; // No brand tokens
      });

      try {
        await agent.assertAllRules({ pr: 'test-pr' });
        expect.fail('Should have thrown error for missing brand tokens');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('Rule Agent FAILED');
      }
    });

    it('should validate Inter font usage', async () => {
      mockFs.existsSync.mockImplementation((path: any) => {
        return path.includes('layout.tsx') || path.includes('globals.css');
      });
      
      mockFs.readFileSync.mockImplementation((path: any) => {
        if (path.includes('layout.tsx')) {
          return `
            import { Inter } from 'next/font/google';
            const inter = Inter({ subsets: ['latin'] });
          `;
        }
        if (path.includes('globals.css')) {
          return '@theme inline { --color-primary: #000; }';
        }
        return '';
      });

      const result = await agent.assertAllRules({ pr: 'test-pr' });
      
      const interResult = result.categories.ux.find(r => r.message.includes('Inter Font'));
      expect(interResult?.passed).toBe(true);
    });
  });

  describe('Tech Rules Validation', () => {
    it('should validate App Router usage', async () => {
      mockFs.existsSync.mockImplementation((path: any) => {
        if (path.includes('src/app')) return true;
        if (path.includes('src/pages')) return false; // No Pages Router
        if (path.includes('globals.css')) return true;
        if (path.includes('layout.tsx')) return true;
        return false;
      });

      mockFs.readFileSync.mockImplementation((path: any) => {
        if (path.includes('globals.css')) {
          return '@theme inline { --color-primary: #000; }';
        }
        if (path.includes('layout.tsx')) {
          return 'import { Inter } from "next/font/google";';
        }
        return '';
      });

      const result = await agent.assertAllRules({ pr: 'test-pr' });
      
      const appRouterResult = result.categories.tech.find(r => r.message.includes('App Router'));
      expect(appRouterResult?.passed).toBe(true);
    });

    it('should validate TypeScript strict mode', async () => {
      mockFs.existsSync.mockImplementation((path: any) => {
        return path.includes('tsconfig.json') || 
               path.includes('globals.css') || 
               path.includes('layout.tsx') ||
               path.includes('src/app');
      });
      
      mockFs.readFileSync.mockImplementation((path: any) => {
        if (path.includes('tsconfig.json')) {
          return JSON.stringify({
            compilerOptions: {
              strict: true,
            },
          });
        }
        if (path.includes('globals.css')) {
          return '@theme inline { --color-primary: #000; }';
        }
        if (path.includes('layout.tsx')) {
          return 'import { Inter } from "next/font/google";';
        }
        return '';
      });

      const result = await agent.assertAllRules({ pr: 'test-pr' });
      
      const strictResult = result.categories.tech.find(r => r.message.includes('TypeScript Strict'));
      expect(strictResult?.passed).toBe(true);
    });

    it('should fail when Zod is missing from APIs', async () => {
      // Mock API route without Zod
      const mockApiRoutes = ['src/app/api/test/route.ts'];
      
      // Mock the agent's getApiRoutes method
      vi.spyOn(agent as any, 'getApiRoutes').mockResolvedValue(mockApiRoutes);
      vi.spyOn(agent as any, 'getChangedFiles').mockResolvedValue(['src/app/api/test/route.ts']);

      mockFs.existsSync.mockImplementation((path: any) => {
        return path.includes('src/app') || 
               path.includes('globals.css') || 
               path.includes('layout.tsx') ||
               path.includes('tsconfig.json') ||
               path.includes('api/test/route.ts');
      });
      
      mockFs.readFileSync.mockImplementation((path: any) => {
        if (path.includes('api/test/route.ts')) {
          return `
            export async function POST(request: Request) {
              const body = await request.json(); // No Zod validation
              return Response.json({ success: true });
            }
          `;
        }
        if (path.includes('tsconfig.json')) {
          return JSON.stringify({ compilerOptions: { strict: true } });
        }
        if (path.includes('globals.css')) {
          return '@theme inline { --color-primary: #000; }';
        }
        if (path.includes('layout.tsx')) {
          return 'import { Inter } from "next/font/google";';
        }
        return '';
      });

      try {
        await agent.assertAllRules({ pr: 'test-pr' });
        expect.fail('Should have thrown error for missing Zod validation');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('Rule Agent FAILED');
      }
    });
  });

  describe('Workflow Rules Validation', () => {
    it('should validate module agent pattern when modules are specified', async () => {
      const modules = ['chat', 'bi'];
      
      mockFs.existsSync.mockImplementation((path: any) => {
        if (path.includes('src/core/agents/chatAgent.ts')) return true;
        if (path.includes('src/core/agents/biAgent.ts')) return true;
        return path.includes('src/app') || 
               path.includes('globals.css') || 
               path.includes('layout.tsx') ||
               path.includes('tsconfig.json');
      });

      mockFs.readFileSync.mockImplementation((path: any) => {
        if (path.includes('tsconfig.json')) {
          return JSON.stringify({ compilerOptions: { strict: true } });
        }
        if (path.includes('globals.css')) {
          return '@theme inline { --color-primary: #000; }';
        }
        if (path.includes('layout.tsx')) {
          return 'import { Inter } from "next/font/google";';
        }
        return '';
      });

      const result = await agent.assertAllRules({ pr: 'test-pr', modules });
      
      const moduleAgentResult = result.categories.workflow.find(r => r.message.includes('Module Agent'));
      expect(moduleAgentResult?.passed).toBe(true);
    });
  });

  describe('assertAllRules function', () => {
    it('should export assertAllRules function', () => {
      expect(typeof assertAllRules).toBe('function');
    });

    it('should throw error for critical failures', async () => {
      mockFs.existsSync.mockImplementation(() => false); // No files exist

      await expect(assertAllRules({ pr: 'test-pr' })).rejects.toThrow('Rule Agent FAILED');
    });
  });

  describe('Overall scoring', () => {
    it('should calculate correct overall score', async () => {
      // Mock perfect setup
      mockFs.existsSync.mockImplementation((path: any) => {
        return !path.includes('src/pages'); // No Pages Router
      });
      
      mockFs.readFileSync.mockImplementation((path: any) => {
        if (path.includes('tsconfig.json')) {
          return JSON.stringify({ compilerOptions: { strict: true } });
        }
        if (path.includes('globals.css')) {
          return '@theme inline { --color-primary: #000; }';
        }
        if (path.includes('layout.tsx')) {
          return 'import { Inter } from "next/font/google";';
        }
        if (path.includes('package.json')) {
          return JSON.stringify({
            dependencies: { 'framer-motion': '^10.0.0' },
            devDependencies: { 'eslint-plugin-jsx-a11y': '^6.0.0' }
          });
        }
        return '';
      });

      mockFs.readdirSync.mockImplementation(() => []);

      const result = await agent.assertAllRules({ pr: 'test-pr' });
      
      expect(result.overallScore).toBeGreaterThan(0);
      expect(result.gateStatus).toBeDefined();
      expect(['PASS', 'FAIL', 'WARNING']).toContain(result.gateStatus);
    });
  });
});
