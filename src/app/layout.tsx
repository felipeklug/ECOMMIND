import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SWRProvider from '@/components/providers/SWRProvider'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'ECOMMIND - Gestão Inteligente para E-commerce',
  description: 'A única plataforma que transforma seu WhatsApp no centro de comando do seu e-commerce, unindo BI em tempo real, gestão de equipe e alertas inteligentes numa experiência conversacional premium.',
  keywords: ['ecommerce', 'bi', 'whatsapp', 'analytics', 'management', 'gestão', 'fintech', 'premium'],
  authors: [{ name: 'ECOMMIND Team' }],
  openGraph: {
    title: 'ECOMMIND - Gestão Inteligente para E-commerce',
    description: 'Transforme seu WhatsApp no centro de comando do seu e-commerce',
    type: 'website',
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0B0D17',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="light">
      <body className={`${inter.variable} font-sans antialiased bg-gray-50 dark:bg-slate-900`}>
        <SWRProvider>
          <div className="min-h-screen">
            {children}
          </div>
        </SWRProvider>
      </body>
    </html>
  )
}