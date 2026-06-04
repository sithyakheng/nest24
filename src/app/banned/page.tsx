'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function BannedPage() {
  const router = useRouter()
  const [reason, setReason] = useState('Violation of NestKH Terms of Service')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadBanStatus() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('banned, ban_reason')
        .eq('id', user.id)
        .single()

      if (profile?.banned === true) {
        if (profile.ban_reason) {
          setReason(profile.ban_reason)
        }
        setLoading(false)
        return
      }

      router.push('/')
    }

    loadBanStatus()
  }, [router])

  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center px-4 py-12">
      <div style={{ maxWidth: '640px', width: '100%' }}>
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', letterSpacing: '0.25em', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px' }}>
            NestKH
          </div>
          <div style={{ margin: '0 auto', width: '60px', height: '2px', background: 'rgba(255,255,255,0.08)' }} />
        </div>

        <div style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(148,163,184,0.12)', borderRadius: '24px', padding: '40px', boxShadow: '0 30px 80px rgba(15,23,42,0.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '120px', marginBottom: '28px', borderRadius: '24px', background: 'rgba(248,113,113,0.06)' }}>
            <span style={{ fontSize: '72px', lineHeight: 1 }}>🚫</span>
          </div>

          <h1 style={{ fontSize: '38px', fontWeight: 800, lineHeight: 1.05, marginBottom: '18px', textAlign: 'center' }}>
            You Have Been Banned
          </h1>

          <p style={{ color: '#cbd5e1', fontSize: '16px', lineHeight: '1.8', marginBottom: '24px', textAlign: 'center' }}>
            Your account has been suspended from NestKH.
          </p>

          <div style={{ background: 'rgba(30,41,59,0.95)', border: '1px solid rgba(148,163,184,0.16)', borderRadius: '18px', padding: '20px', marginBottom: '24px' }}>
            <p style={{ color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '10px' }}>Reason</p>
            <p style={{ color: 'white', fontSize: '16px', lineHeight: '1.7' }}>{loading ? 'Checking ban status...' : reason}</p>
          </div>

          <p style={{ color: '#cbd5e1', fontSize: '15px', lineHeight: '1.8', marginBottom: '28px', textAlign: 'center' }}>
            If you believe this is a mistake, please contact us.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <a
              href="mailto:support@nestkh.com"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#ef4444',
                color: 'white',
                borderRadius: '9999px',
                padding: '14px 24px',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 20px 40px rgba(239,68,68,0.25)'
              }}
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
