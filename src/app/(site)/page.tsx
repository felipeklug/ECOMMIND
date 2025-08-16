/**
 * Home Page - Página inicial do site ECOMMIND
 */

import { Metadata } from 'next';
import { Hero } from '@/features/site/components/Hero';
import { FeatureGrid } from '@/features/site/components/FeatureGrid';
import { ModulesSection } from '@/features/site/components/ModulesSection';
import { HowItWorks } from '@/features/site/components/HowItWorks';
import { BenefitsSection } from '@/features/site/components/BenefitsSection';
import { PricingSection } from '@/features/site/components/PricingSection';
import { SecuritySection } from '@/features/site/components/SecuritySection';
import { TestimonialsSection } from '@/features/site/components/TestimonialsSection';
import { FAQSection } from '@/features/site/components/FAQSection';
import { CTASection } from '@/features/site/components/CTASection';

export const metadata: Metadata = {
  title: 'ECOMMIND - Inteligência para E-commerce',
  description: 'Transforme seus dados de e-commerce em insights acionáveis. BI inteligente, Chat 360, automações e muito mais. Integre Mercado Livre, Shopee e outros marketplaces.',
  openGraph: {
    title: 'ECOMMIND - Inteligência para E-commerce',
    description: 'Transforme seus dados de e-commerce em insights acionáveis. BI inteligente, Chat 360, automações e muito mais.',
    url: 'https://ecommind.com.br',
    images: [
      {
        url: '/og-home.png',
        width: 1200,
        height: 630,
        alt: 'ECOMMIND - Dashboard de E-commerce',
      },
    ],
  },
};

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <Hero />

      {/* Features Grid */}
      <FeatureGrid />

      {/* Modules Section */}
      <ModulesSection />

      {/* How It Works */}
      <HowItWorks />

      {/* Benefits & KPIs */}
      <BenefitsSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Pricing */}
      <PricingSection />

      {/* Security */}
      <SecuritySection />

      {/* FAQ */}
      <FAQSection />

      {/* Final CTA */}
      <CTASection />
    </>
  );
}
