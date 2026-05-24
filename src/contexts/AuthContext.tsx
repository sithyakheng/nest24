'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext<{ 
  user: User | null, 
  loading: boolean,
  signOut: () => Promise<void>
}>({ 
  user: null, 
  loading: true,
  signOut: async () => {} 
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      if (typeof window !== 'undefined') {
        // Clear all client session storage and common Supabase token keys.
        const sessionKeys = [
          'nestkh-auth',
          'supabase.auth.token',
          'supabase.db.token',
          'sb:token',
          'sb-refresh-token'
        ]
        sessionKeys.forEach((key) => window.localStorage.removeItem(key))
        window.localStorage.clear()
        window.sessionStorage.clear()

        // Clear all cookies (basic approach)
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date(0).toUTCString() + ";path=/;SameSite=Lax;Secure")
        })
      }
      setUser(null)
      setLoading(false)
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
        window.location.href = '/'
      }
      if (event === 'SIGNED_IN') {
        setUser(session?.user ?? null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) return

    const redirectToPin = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('role, security_pin')
          .eq('id', user.id)
          .single()

        if (
          data?.role === 'seller' &&
          data?.security_pin &&
          typeof window !== 'undefined' &&
          sessionStorage.getItem('seller_pin_verified') !== 'true' &&
          window.location.pathname !== '/verify-pin'
        ) {
          router.push('/verify-pin')
        }
      } catch (err) {
        console.error('Error checking seller PIN redirect:', err)
      }
    }

    redirectToPin()
  }, [user, router])

  return <AuthContext.Provider value={{ user, loading, signOut }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
