'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

interface SellerProfile {
  id: string
  role: string
  security_pin: string | null
}

export function useSellerPinCheck() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<SellerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [needsPin, setNeedsPin] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const { data } = await supabase
          .from('profiles')
          .select('id, role, security_pin')
          .eq('id', user.id)
          .single()

        setProfile(data)

        // Check if seller has PIN and it's not verified in this session
        const isPinVerified = sessionStorage.getItem('seller_pin_verified') === 'true'
        if (data?.role === 'seller' && data?.security_pin && !isPinVerified) {
          setNeedsPin(true)
        } else {
          setNeedsPin(false)
        }
      } catch (err) {
        console.error('Error fetching seller profile:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user])

  return { profile, loading, needsPin }
}
