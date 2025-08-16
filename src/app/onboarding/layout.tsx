import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Onboarding - ECOMMIND',
  description: 'Configure sua conta ECOMMIND em poucos passos',
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {children}
    </div>
  )
}
