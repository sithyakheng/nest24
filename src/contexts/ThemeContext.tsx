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
    document.body.style.backgroundColor = newTheme ? '#080a0f' : '#f0f4f8'
    document.body.style.color = newTheme ? '#ffffff' : '#0f172a'
  }

  useEffect(() => {
    const saved = localStorage.getItem('nestkh-theme') || 'dark'
    const dark = saved === 'dark'
    setIsDark(dark)
    document.documentElement.setAttribute('data-theme', saved)
    document.body.style.backgroundColor = dark ? '#080a0f' : '#f0f4f8'
    document.body.style.color = dark ? '#ffffff' : '#0f172a'
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
