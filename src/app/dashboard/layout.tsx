import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ThemeProvider } from '@/hooks/useTheme'

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect('/login')
  }

  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  )
}
