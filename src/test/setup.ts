/**
 * Test Setup
 * Configuração global para testes
 */

import { vi } from 'vitest';

// Mock do processo Node.js
Object.defineProperty(process, 'cwd', {
  value: () => '/mock/project/root',
});

// Mock de variáveis de ambiente
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

// Mock global do fetch
global.fetch = vi.fn();

// Mock do console para testes mais limpos
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
};
