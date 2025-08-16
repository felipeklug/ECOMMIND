'use client'

import React, { memo } from 'react'
import type { User } from '@supabase/supabase-js'
import { SidebarProvider } from '@/hooks/useSidebar'
import { ThemeProvider } from '@/hooks/useTheme'
import { UltraPremiumSidebar } from './UltraPremiumSidebar'
import { UltraPremiumHeader } from './UltraPremiumHeader'

interface DashboardLayoutProps {
  children: React.ReactNode
  user: User
}

const DashboardLayout = memo(({ children, user }: DashboardLayoutProps) => {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex">
          {/* ECOMMIND Brand Background Effects */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-600/3 to-blue-600/3 rounded-full blur-3xl"></div>
          </div>

          {/* Ultra Premium Sidebar */}
          <UltraPremiumSidebar />

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0 relative z-10">
            {/* Ultra Premium Header */}
            <UltraPremiumHeader user={user} />

            {/* Page Content */}
            <main className="flex-1 p-8 overflow-auto">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  )
})

DashboardLayout.displayName = 'DashboardLayout'

export default DashboardLayout


