'use client'

import { createContext, useContext, useState, useEffect } from 'react'

interface ThemeContextType {
  theme: 'dark' | 'light'
  isDark: boolean
  toggleTheme: () => void
  background: string
  backgroundSecondary: string
  text: string
  textSecondary: string
  border: string
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  isDark: true,
  toggleTheme: () => {},
  background: '#080a0f',
  backgroundSecondary: '#0f1a2e',
  text: '#ffffff',
  textSecondary: '#94a3b8',
  border: 'rgba(255,255,255,0.1)'
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true)
  const theme = isDark ? 'dark' : 'light'

  function toggleTheme() {
    const newTheme = !isDark
    setIsDark(newTheme)
    localStorage.setItem('nestkh-theme', newTheme ? 'dark' : 'light')
    document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light')
    document.documentElement.classList.toggle('light', !newTheme)
    document.documentElement.classList.toggle('dark', newTheme)
  }

  useEffect(() => {
    const saved = localStorage.getItem('nestkh-theme') || 'dark'
    const dark = saved === 'dark'
    setIsDark(dark)
    document.documentElement.setAttribute('data-theme', saved)
    document.documentElement.classList.toggle('light', !dark)
    document.documentElement.classList.toggle('dark', dark)
  }, [])

  const colors = {
    dark: {
      background: '#080a0f',
      backgroundSecondary: '#0f1a2e',
      text: '#ffffff',
      textSecondary: '#94a3b8',
      border: 'rgba(255,255,255,0.1)'
    },
    light: {
      background: '#f8fafc',
      backgroundSecondary: '#ffffff',
      text: '#0f172a',
      textSecondary: '#64748b',
      border: '#e2e8f0'
    }
  }

  const themeColors = colors[theme]

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, ...themeColors }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
