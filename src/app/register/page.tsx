'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useLang } from '@/contexts/LanguageContext'
import { sanitizeInput, isValidEmail } from '@/lib/security'

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
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [honeypot, setHoneypot] = useState('') // Honeypot field for bot protection

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    
    // Bot check: If honeypot is filled, it's likely a bot
    if (honeypot) {
      console.log('Bot detected via honeypot')
      // Reject silently or redirect to success page to fool bots
      setSuccess(true)
      return
    }
    
    if (!agreeToTerms) {
      setError('You must agree to the Terms & Conditions and Privacy Policy to continue.')
      return
    }

    const sanitizedFullName = sanitizeInput(fullName)
    const sanitizedEmail = email.trim().toLowerCase()
    const sanitizedPhone = sanitizeInput(phone)

    if (!isValidEmail(sanitizedEmail)) {
      setError('Please enter a valid email address.')
      return
    }

    // Password strength validation: 8 chars, 1 number, 1 uppercase
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/
    if (!passwordRegex.test(password)) {
      setError('Password must be at least 8 characters long and include at least one uppercase letter and one number.')
      return
    }
    
    // Validate phone for sellers
    if (role === 'seller' && !sanitizedPhone) {
      setError('Phone number is required for sellers.')
      return
    }
    
    setLoading(true)
    setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: sanitizedEmail,
      password,
      options: {
        data: { role, full_name: sanitizedFullName }
      }
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      const shop_slug = role === 'seller' 
        ? sanitizedFullName.replace(/\s+/g, '').toLowerCase()
        : null

      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        email: sanitizedEmail,
        full_name: sanitizedFullName,
        name: sanitizedFullName,
        role,
        shop_slug,
        phone: role === 'seller' ? sanitizedPhone : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

      if (profileError) {
        console.error('Profile creation error:', profileError)
      }
    }

    if (role === 'seller') {
      window.location.href = '/dashboard'
    } else {
      setSuccess(true)
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

  if (success) {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm max-w-md w-full text-center">
          <div className="text-4xl mb-4">📧</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
          <p className="text-gray-600 mb-6">We've sent a verification link to your email address. Please click the link to activate your account.</p>
          <button onClick={() => router.push('/login')} className="w-full bg-[#004E64] text-white font-bold py-3 rounded-xl">
            Back to Login
          </button>
        </div>
      </div>
    )
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
        <h1 className="text-3xl font-black text-gray-900 mb-2">{t('auth.register_title')}</h1>
        <p className="text-gray-500 font-light mb-8">{t('auth.register_sub')}</p>

        {/* Role Toggle */}
        <div className="flex gap-2 mb-6 p-1 rounded-full"
          style={{ background: '#f9fafb',
          border: '1px solid #e5e7eb' }}>
          <button
            type="button"
            onClick={() => setRole('buyer')}
            className="flex-1 py-2 rounded-full text-sm font-medium transition-all"
            style={{
              background: role === 'buyer' 
                ? '#004E64' : 'white',
              color: role === 'buyer' 
                ? 'white' : '#374151',
              border: role === 'buyer' 
                ? '1px solid #004E64' : '1px solid #d1d5db',
              fontWeight: role === 'buyer' ? 'bold' : 'normal'
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
                ? '#004E64' : 'rgba(0,0,0,0.08)',
              color: role === 'seller' 
                ? 'white' : '#0f172a',
              border: role === 'seller' 
                ? '1px solid #004E64' : '1px solid #cbd5e1',
              fontWeight: role === 'seller' ? 'bold' : 'normal'
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
          {/* Honeypot field (hidden from users) */}
          <div style={{ display: 'none' }} aria-hidden="true">
            <input
              type="text"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>
          
          <input
            type="text"
            placeholder={t('auth.full_name')}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full text-gray-900 placeholder:text-gray-400 rounded-xl px-4 py-3 outline-none"
            style={{
              background: 'white',
              border: '1px solid #d1d5db',
            }}
          />
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
          
          {/* Phone Number - Only for Sellers */}
          {role === 'seller' && (
            <input
              type="tel"
              placeholder="Your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full text-gray-900 placeholder:text-gray-400 rounded-xl px-4 py-3 outline-none"
              style={{
                background: 'white',
                border: '1px solid #d1d5db',
              }}
            />
          )}
          
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
              color: '#6b7280', 
              fontSize: '14px', 
              lineHeight: '1.5',
              cursor: 'pointer',
              userSelect: 'none'
            }}>
              I agree to the{' '}
              <Link 
                href="/terms" 
                style={{ color: '#004E64', textDecoration: 'none' }}
                target="_blank"
                onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
              >
                Terms & Conditions
              </Link>
              {' '}and{' '}
              <Link 
                href="/privacy" 
                style={{ color: '#004E64', textDecoration: 'none' }}
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
            className="w-full font-bold rounded-full py-3 text-white"
            style={{
              background: '#004E64'
            }}
          >
            {loading ? t('auth.creating') : t('auth.register_btn')}
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
          {t('auth.have_account')}{' '}
          <Link href="/login" 
            className="text-[#004E64] hover:text-[#003a52]">
            {t('auth.login_btn')}
          </Link>
        </p>
      </div>
    </div>
  )
}
