'use client'

import { createContext, useContext, useState, useEffect } from 'react'

interface ThemeContextType {
  isDark: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  toggleTheme: () => {}
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true)

  function toggleTheme() {
    const newTheme = !isDark
    setIsDark(newTheme)
    localStorage.setItem('nestkh-theme', newTheme ? 'dark' : 'light')
    document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light')
    document.documentElement.classList.toggle('light-mode', !newTheme)
    document.documentElement.classList.toggle('dark-mode', newTheme)
  }

  useEffect(() => {
    const saved = localStorage.getItem('nestkh-theme') || 'dark'
    const dark = saved === 'dark'
    setIsDark(dark)
    document.documentElement.setAttribute('data-theme', saved)
    document.documentElement.classList.toggle('light-mode', !dark)
    document.documentElement.classList.toggle('dark-mode', dark)
  }, [])

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
