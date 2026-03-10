'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useLang } from '@/contexts/LanguageContext'

export default function RegisterPage() {
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
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [agreeToTerms, setAgreeToTerms] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    
    if (!agreeToTerms) {
      setError('You must agree to the Terms & Conditions and Privacy Policy to continue.')
      return
    }
    
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role, full_name: fullName }
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email,
        full_name: fullName,
        name: fullName,
        role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    }

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
        <h1 className="text-3xl font-black text-white mb-2">{t('auth.register_title')}</h1>
        <p className="text-white/50 font-light mb-8">{t('auth.register_sub')}</p>

        {/* Role Toggle */}
        <div className="flex gap-2 mb-6 p-1 rounded-full"
          style={{ background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.10)' }}>
          <button
            type="button"
            onClick={() => setRole('buyer')}
            className="flex-1 py-2 rounded-full text-sm font-medium transition-all"
            style={{
              background: role === 'buyer' 
                ? 'rgba(0,78,100,0.4)' : 'transparent',
              color: role === 'buyer' 
                ? '#4DB8CC' : 'rgba(255,255,255,0.5)',
              border: role === 'buyer' 
                ? '1px solid rgba(0,78,100,0.5)' : '1px solid transparent'
            }}
          >
            {t('auth.i_am')} {t('auth.buyer')}
          </button>
          <button
            type="button"
            onClick={() => setRole('seller')}
            className="flex-1 py-2 rounded-full text-sm font-medium transition-all"
            style={{
              background: role === 'seller' 
                ? 'rgba(0,78,100,0.4)' : 'transparent',
              color: role === 'seller' 
                ? '#4DB8CC' : 'rgba(255,255,255,0.5)',
              border: role === 'seller' 
                ? '1px solid rgba(0,78,100,0.5)' : '1px solid transparent'
            }}
          >
            {t('auth.i_am')} {t('auth.seller')}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl text-red-400 text-sm"
            style={{ background: 'rgba(255,80,80,0.1)',
            border: '1px solid rgba(255,80,80,0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder={t('auth.full_name')}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full text-white placeholder:text-white/30 rounded-xl px-4 py-3 outline-none"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          />
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
          
          {/* Terms and Privacy Checkbox */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginTop: '8px' }}>
            <input
              type="checkbox"
              id="terms"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              style={{
                marginTop: '4px',
                width: '16px',
                height: '16px',
                accentColor: '#4DB8CC',
                cursor: 'pointer'
              }}
            />
            <label htmlFor="terms" style={{ 
              color: 'rgba(255,255,255,0.7)', 
              fontSize: '14px', 
              lineHeight: '1.5',
              cursor: 'pointer',
              userSelect: 'none'
            }}>
              I agree to the{' '}
              <Link 
                href="/terms" 
                style={{ color: '#4DB8CC', textDecoration: 'none' }}
                target="_blank"
                onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
              >
                Terms & Conditions
              </Link>
              {' '}and{' '}
              <Link 
                href="/privacy" 
                style={{ color: '#4DB8CC', textDecoration: 'none' }}
                target="_blank"
                onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
              >
                Privacy Policy
              </Link>
            </label>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full font-bold rounded-full py-3 text-black"
            style={{
              background: 'linear-gradient(135deg, #E8C97E, #F0B429)'
            }}
          >
            {loading ? t('auth.creating') : t('auth.register_btn')}
          </button>
        </form>

        <p className="text-white/40 text-sm text-center mt-6">
          {t('auth.have_account')}{' '}
          <Link href="/login" 
            className="text-teal-400 hover:text-teal-300">
            {t('auth.login_btn')}
          </Link>
        </p>
      </div>
    </div>
  )
}
