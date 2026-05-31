'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useLang } from '@/contexts/LanguageContext'

const LOGIN_ATTEMPT_KEY = 'nestkh_login_attempts'
const LOGIN_LOCKOUT_KEY = 'nestkh_login_lockout'
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 15 * 60 * 1000

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

    const lockoutUntil = window.localStorage.getItem(LOGIN_LOCKOUT_KEY)
    if (lockoutUntil && new Date(lockoutUntil) > new Date()) {
      setError('Too many login attempts. Please try again later.')
      return
    }

    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, password 
    })

    if (error) {
      const attempts = Number(window.localStorage.getItem(LOGIN_ATTEMPT_KEY) || 0) + 1
      window.localStorage.setItem(LOGIN_ATTEMPT_KEY, String(attempts))

      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        const lockoutExpiry = new Date(Date.now() + LOCKOUT_DURATION_MS)
        window.localStorage.setItem(LOGIN_LOCKOUT_KEY, lockoutExpiry.toISOString())
        window.localStorage.removeItem(LOGIN_ATTEMPT_KEY)
        setError('Too many login attempts. Locked for 15 minutes.')
      } else {
        setError(error.message)
      }

      setLoading(false)
      return
    }

    window.localStorage.removeItem(LOGIN_ATTEMPT_KEY)
    window.localStorage.removeItem(LOGIN_LOCKOUT_KEY)

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

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) console.error('Google sign in error:', error)
  }

  const handleFacebookSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) console.error('Facebook sign in error:', error)
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center" style={{ paddingTop: '100px', paddingBottom: '40px', paddingLeft: '16px', paddingRight: '16px' }}>
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '24px',
        padding: isMobile ? '24px 20px' : '48px',
        width: '100%',
        maxWidth: isMobile ? '100%' : '440px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <p style={{ color: '#111827', fontWeight: '900', fontSize: '28px', margin: '0 0 4px 0', textAlign: 'center' }}>
          NestKH<span style={{ color: '#004E64' }}>.</span>
        </p>
        <h1 className="text-3xl font-black text-gray-900 mb-2">{t('auth.login_title')}</h1>
        <p className="text-gray-500 font-light mb-8">{t('auth.login_sub')}</p>
        
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
            className="w-full text-gray-900 placeholder:text-gray-400 rounded-xl px-4 py-3 outline-none"
            style={{
              background: 'white',
              border: '1px solid #d1d5db',
            }}
          />
          <input
            type="password"
            placeholder={t('auth.password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full text-gray-900 placeholder:text-gray-400 rounded-xl px-4 py-3 outline-none"
            style={{
              background: 'white',
              border: '1px solid #d1d5db',
            }}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full font-bold rounded-full py-3 text-white"
            style={{
              background: '#004E64'
            }}
          >
            {loading ? t('auth.signing_in') : t('auth.login_btn')}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          <span style={{ color: '#6b7280', fontSize: '14px', whiteSpace: 'nowrap' }}>Or continue with</span>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full font-semibold rounded-xl py-3"
            style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              color: '#111827',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: '100%'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f4f6')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.5 12.2468C22.5 11.3682 22.4243 10.5074 22.283 9.66675H12V14.4334H18.6834C18.4833 15.8334 17.7943 16.9999 16.6834 17.8134V20.4018H20.475C22.295 18.725 23.5 15.81 23.5 12.2468Z" fill="#4285F4"/>
              <path d="M12 23.9999C15.2409 23.9999 17.9999 23.0341 20.2118 21.4318L16.6834 18.8434C15.7084 19.5118 14.4559 19.8999 12.9999 19.8999C9.93241 19.8999 7.35593 17.7518 6.50243 14.9868H2.76093V17.6557C4.97668 21.9141 8.19336 23.9999 12 23.9999Z" fill="#34A853"/>
              <path d="M6.50243 14.9868C6.28343 14.2857 6.16676 13.5457 6.16676 12.7618C6.16676 11.9779 6.28343 11.2379 6.50243 10.5368V7.86804H2.76093C2.03418 9.38679 1.58301 11.0607 1.58301 12.7618C1.58301 14.4629 2.03418 16.1368 2.76093 17.6556L6.50243 14.9868Z" fill="#FBBC05"/>
              <path d="M12 5.62344C13.5849 5.62344 14.9809 6.11844 16.1259 7.06094L19.7259 3.46094C17.9959 1.93594 15.2859 0.999938 12 0.999938C8.19336 0.999938 4.97668 3.08569 2.76093 7.34406L6.50243 10.013C7.35593 7.24806 9.93241 5.09994 12 5.09994V5.62344Z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>

          <button
            type="button"
            onClick={handleFacebookSignIn}
            className="w-full font-semibold rounded-xl py-3"
            style={{
              background: '#1877F2',
              border: '1px solid #1877F2',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: '100%'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#166FE5')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#1877F2')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.675 0H1.325C0.593 0 0 0.593 0 1.325V22.676C0 23.407 0.593 24 1.325 24H12.82V14.706H9.692V11.082H12.82V8.413C12.82 5.414 14.688 3.75 17.382 3.75C18.69 3.75 19.857 3.842 20.167 3.881V7.08L18.123 7.081C16.517 7.081 16.201 7.796 16.201 8.873V11.083H20.041L19.575 14.707H16.201V24H22.676C23.407 24 24 23.407 24 22.676V1.325C24 0.593 23.407 0 22.675 0Z"/>
            </svg>
            Sign in with Facebook
          </button>
        </div>

        <p className="text-gray-500 text-sm text-center mt-6">
          {t('auth.no_account')}{' '}
          <Link href="/register" 
            className="text-[#004E64] hover:text-[#003a52]">
            {t('auth.register_btn')}
          </Link>
        </p>
      </div>
    </div>
  )
}
