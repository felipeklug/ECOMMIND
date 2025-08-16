/**
 * App Layout - Layout principal do aplicativo
 * RuleAgent Gate: Validação dos 3 prompts fundamentais
 */

import { assertAllRules } from '@/core/agents/RuleAgent';
import { Inter } from 'next/font/google';
import { Metadata } from 'next';
import { AppShell } from '@/features/shell/AppShell';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { CommandKProvider } from '@/features/shell/CommandKProvider';
import '@/app/globals.css';

// RuleAgent Gate - Validação automática
if (process.env.NODE_ENV !== 'test') {
  assertAllRules({ pr: 'PR#20.2', modules: ['shell', 'app', 'rbac'] }).catch(console.error);
}

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'ECOMMIND App',
    template: '%s | ECOMMIND',
  },
  description: 'Plataforma de inteligência para e-commerce',
  robots: {
    index: false,
    follow: false,
  },
};

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Preconnect para performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen bg-background font-inter antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <CommandKProvider>
            <AppShell>
              {children}
            </AppShell>
            <Toaster />
          </CommandKProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
