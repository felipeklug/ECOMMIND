/**
 * Site Layout - Layout público do ECOMMIND
 * RuleAgent Gate: Validação dos 3 prompts fundamentais
 */

import { assertAllRules } from '@/core/agents/RuleAgent';
import { Inter } from 'next/font/google';
import { Metadata } from 'next';
import { SiteHeader } from '@/features/site/components/SiteHeader';
import { SiteFooter } from '@/features/site/components/SiteFooter';
import { CookieBanner } from '@/features/site/components/CookieBanner';
import { ThemeProvider } from '@/components/theme-provider';
import '@/app/globals.css';

// RuleAgent Gate - Validação automática
if (process.env.NODE_ENV !== 'test') {
  assertAllRules({ pr: 'PR#20.0', modules: ['site', 'marketing'] }).catch(console.error);
}

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'ECOMMIND - Inteligência para E-commerce',
    template: '%s | ECOMMIND',
  },
  description: 'Plataforma completa de inteligência para e-commerce com BI, Chat 360, automações e insights acionáveis. Integre seus marketplaces e tome decisões baseadas em dados.',
  keywords: [
    'e-commerce',
    'business intelligence',
    'chat 360',
    'automação',
    'marketplace',
    'mercado livre',
    'shopee',
    'analytics',
    'insights',
    'LGPD',
  ],
  authors: [{ name: 'ECOMMIND' }],
  creator: 'ECOMMIND',
  publisher: 'ECOMMIND',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://ecommind.com.br',
    siteName: 'ECOMMIND',
    title: 'ECOMMIND - Inteligência para E-commerce',
    description: 'Plataforma completa de inteligência para e-commerce com BI, Chat 360, automações e insights acionáveis.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ECOMMIND - Inteligência para E-commerce',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ECOMMIND - Inteligência para E-commerce',
    description: 'Plataforma completa de inteligência para e-commerce com BI, Chat 360, automações e insights acionáveis.',
    images: ['/og-image.png'],
    creator: '@ecommind',
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: 'https://ecommind.com.br',
  },
};

interface SiteLayoutProps {
  children: React.ReactNode;
}

export default function SiteLayout({ children }: SiteLayoutProps) {
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
        <link rel="manifest" href="/manifest.json" />
        
        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'ECOMMIND',
              url: 'https://ecommind.com.br',
              logo: 'https://ecommind.com.br/logo.png',
              description: 'Plataforma completa de inteligência para e-commerce',
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'BR',
              },
              sameAs: [
                'https://linkedin.com/company/ecommind',
                'https://twitter.com/ecommind',
              ],
            }),
          }}
        />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'ECOMMIND',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'BRL',
                description: 'Plano gratuito disponível',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                ratingCount: '150',
              },
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-background font-inter antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
          <CookieBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}
