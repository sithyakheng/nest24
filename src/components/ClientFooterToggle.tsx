'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Footer from './Footer'

export default function ClientFooterToggle({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const hideFooter = pathname?.startsWith('/banned')

  return (
    <>
      {children}
      {!hideFooter && <Footer />}
    </>
  )
}
