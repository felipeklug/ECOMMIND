'use client'

import { useState, useEffect, createContext, useContext } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
  mounted: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Recupera tema salvo ou usa claro como padrão
    const savedTheme = localStorage.getItem('dashboard-theme') as Theme
    if (savedTheme) {
      setThemeState(savedTheme)
    } else {
      // Define tema claro como padrão
      setThemeState('light')
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('dashboard-theme', theme)
      // Aplica classe no HTML apenas para o dashboard
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/dashboard')) {
        document.documentElement.classList.toggle('dark', theme === 'dark')
      }
    }
  }, [theme, mounted])

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light')
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
