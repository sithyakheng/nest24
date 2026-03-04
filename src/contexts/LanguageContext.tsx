'use client'

import { createContext, useContext, useState, useEffect } from 'react'

type Language = 'en' | 'kh'

interface LanguageContextType {
  lang: Language
  toggleLang: () => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  toggleLang: () => {},
  t: (key) => key
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('en')

  useEffect(() => {
    const saved = localStorage.getItem('nestkh-lang') as Language
    if (saved === 'en' || saved === 'kh') setLang(saved)
  }, [])

  function toggleLang() {
    const newLang = lang === 'en' ? 'kh' : 'en'
    setLang(newLang)
    localStorage.setItem('nestkh-lang', newLang)
  }

  function t(key: string): string {
    return translations[key]?.[lang] || key
  }

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  return useContext(LanguageContext)
}
