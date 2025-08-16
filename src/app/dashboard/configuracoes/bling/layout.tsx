import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Integração Bling - ECOMMIND',
  description: 'Configure a integração com o Bling ERP',
}

export default function BlingConfigLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
