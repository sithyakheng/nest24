'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useLang } from '@/contexts/LanguageContext'

export default function LoginPage() {
  const { t } = useLang()
  const router = useRouter()
  const [windowWidth, setWindowWidth] = useState(1200)
  const isMobile = windowWidth < 768

  useEffect(() => {
    setWindowWidth(window.innerWidth)
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, password 
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Check if user is banned
    const { data: profile } = await supabase
      .from('profiles')
      .select('banned, role')
      .eq('id', data.user.id)
      .single()

    if (profile?.banned) {
      await supabase.auth.signOut()
      setError('Your account has been banned. Contact support.')
      setLoading(false)
      return
    }

    const role = profile?.role || data.user?.user_metadata?.role
    if (role === 'seller') {
      window.location.href = '/dashboard'
    } else {
      window.location.href = '/'
    }
  }

  return (
    <div className="min-h-screen bg-[#080a0f] flex items-center justify-center" style={{ paddingTop: '100px', paddingBottom: '40px', paddingLeft: '16px', paddingRight: '16px' }}>
      <div style={{
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderTop: '1px solid rgba(255,255,255,0.22)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
        borderRadius: '24px',
        padding: isMobile ? '24px 20px' : '48px',
        width: '100%',
        maxWidth: isMobile ? '100%' : '440px',
      }}>
        <p style={{ color: 'white', fontWeight: '900', fontSize: '28px', margin: '0 0 4px 0', textAlign: 'center' }}>
          NestKH<span style={{ color: '#4DB8CC' }}>.</span>
        </p>
        <h1 className="text-3xl font-black text-white mb-2">{t('auth.login_title')}</h1>
        <p className="text-white/50 font-light mb-8">{t('auth.login_sub')}</p>
        
        {error && (
          <div className="mb-4 p-3 rounded-xl text-red-400 text-sm"
            style={{ background: 'rgba(255,80,80,0.1)', 
            border: '1px solid rgba(255,80,80,0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder={t('auth.email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full text-white placeholder:text-white/30 rounded-xl px-4 py-3 outline-none"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          />
          <input
            type="password"
            placeholder={t('auth.password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full text-white placeholder:text-white/30 rounded-xl px-4 py-3 outline-none"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full font-bold rounded-full py-3 text-black"
            style={{
              background: 'linear-gradient(135deg, #E8C97E, #F0B429)'
            }}
          >
            {loading ? t('auth.signing_in') : t('auth.login_btn')}
          </button>
        </form>

        <p className="text-white/40 text-sm text-center mt-6">
          {t('auth.no_account')}{' '}
          <Link href="/register" 
            className="text-teal-400 hover:text-teal-300">
            {t('auth.register_btn')}
          </Link>
        </p>
      </div>
    </div>
  )
}
