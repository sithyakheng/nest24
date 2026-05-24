'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { saveDeviceSession } from '@/lib/deviceTracking'

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
      const currentUser = user
      
      // Log logout activity
      if (currentUser) {
        try {
          await supabase.from('activity_logs').insert({
            user_id: currentUser.id,
            action: 'Account logged out',
            device: 'N/A',
            ip_address: ''
          })
        } catch (err) {
          console.error('Error logging logout activity:', err)
        }
      }

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

    const handlePostLoginChecks = async () => {
      try {
        // Save device session for this login
        await saveDeviceSession(user.id)

        const { data } = await supabase
          .from('profiles')
          .select('role, security_pin, minefield_enabled, minefield_message')
          .eq('id', user.id)
          .single()

        if (!data) return

        // Show mine field alert only if:
        // 1. Mine field is enabled
        // 2. This is a NEW device (not the original device)
        // 3. Alert hasn't been shown yet in this session
        const isNewDevice = sessionStorage.getItem('is_new_device') === 'true'
        const minefieldShownInSession = sessionStorage.getItem('minefield_shown') === 'true'

        if (
          data.minefield_enabled &&
          data.minefield_message &&
          isNewDevice &&
          !minefieldShownInSession &&
          typeof window !== 'undefined'
        ) {
          sessionStorage.setItem('minefield_shown', 'true')
          window.alert(data.minefield_message)
          await supabase.from('activity_logs').insert({
            user_id: user.id,
            action: 'Mine Field triggered - New device login detected',
            device: 'N/A',
            ip_address: ''
          })
        }

        // Redirect to PIN verify if needed
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
        console.error('Error in post-login checks:', err)
      }
    }

    handlePostLoginChecks()
  }, [user, router])

  return <AuthContext.Provider value={{ user, loading, signOut }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
