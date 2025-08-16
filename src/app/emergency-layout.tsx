import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ECOMMIND - Teste',
  description: 'Teste de funcionamento',
}

export default function EmergencyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, padding: 0, fontFamily: 'Arial, sans-serif' }}>
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
          {children}
        </div>
      </body>
    </html>
  )
}
