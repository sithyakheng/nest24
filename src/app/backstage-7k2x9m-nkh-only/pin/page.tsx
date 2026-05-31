'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ShieldAlert, ArrowLeft, RefreshCw, Lock } from 'lucide-react'
import Link from 'next/link'

export default function AdminPinPage() {
  const router = useRouter()
  const [pin, setPin] = useState<string[]>(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const [lockedOut, setLockedOut] = useState(false)
  const [lockedUntil, setLockedUntil] = useState<number | null>(null)
  const [remainingTime, setRemainingTime] = useState<number>(0)
  const [checkingAuth, setCheckingAuth] = useState(true)
  
  // Refs for each input to manage focus
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ]

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dis7tyccn'
  const logoUrl = `https://res.cloudinary.com/${cloudName}/image/upload/v1773312754/nestkh/rutdnjul41sbyldamczk.png`

  // 1. Authenticate user & check admin role
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.replace('/login?next=/backstage-7k2x9m-nkh-only')
          return
        }
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profileError || !profile || profile.role !== 'admin') {
          router.replace('/')
          return
        }
        
        setCheckingAuth(false)
      } catch (err) {
        console.error('Auth verification error:', err)
        router.replace('/')
      }
    }
    checkAuth()
  }, [router])

  // 2. Lockout Countdown Timer
  useEffect(() => {
    if (!lockedUntil) return

    const interval = setInterval(() => {
      const diff = lockedUntil - Date.now()
      if (diff <= 0) {
        setLockedOut(false)
        setLockedUntil(null)
        setError('')
        clearInterval(interval)
      } else {
        setRemainingTime(Math.ceil(diff / 1000))
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [lockedUntil])

  // 3. Handle Input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value
    // Take only last character
    const char = value.slice(-1)
    
    // Allow digits and alpha-numeric values since PIN is a 6-char PIN
    const newPin = [...pin]
    newPin[index] = char
    setPin(newPin)

    // Clear error on user interaction
    setError('')

    // Auto advance to next box
    if (char !== '' && index < 5) {
      inputRefs[index + 1].current?.focus()
    }
  }

  // 4. Handle Backspaces
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (pin[index] === '' && index > 0) {
        const newPin = [...pin]
        newPin[index - 1] = ''
        setPin(newPin)
        inputRefs[index - 1].current?.focus()
      } else {
        const newPin = [...pin]
        newPin[index] = ''
        setPin(newPin)
      }
      setError('')
    }
  }

  // 5. Handle Pasting
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasteData = e.clipboardData.getData('text').trim()
    if (pasteData.length === 6) {
      const newPin = pasteData.split('').slice(0, 6)
      setPin(newPin)
      inputRefs[5].current?.focus()
      setError('')
    }
  }

  // 6. Submit verification
  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    const pinString = pin.join('')
    if (pinString.length !== 6) {
      setError('Please enter all 6 characters.')
      triggerShake()
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/verify-admin-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinString })
      })

      const data = await res.json()

      if (res.status === 200 && data.success) {
        sessionStorage.setItem('admin_pin_verified', 'true')
        router.replace('/backstage-7k2x9m-nkh-only')
      } else if (res.status === 423 || data.lockedOut) {
        setLockedOut(true)
        setLockedUntil(data.lockedUntil)
        setError(data.error)
        triggerShake()
      } else {
        setError(data.error || 'Incorrect PIN code.')
        triggerShake()
      }
    } catch (err) {
      console.error('Verification request failed:', err)
      setError('Connection error. Please try again.')
      triggerShake()
    } finally {
      setLoading(false)
    }
  }

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  const formatRemainingTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  // Auto-verify when 6th character is entered
  useEffect(() => {
    if (pin.join('').length === 6 && !lockedOut) {
      handleVerify()
    }
  }, [pin])

  if (checkingAuth) {
    return (
      <div style={{ minHeight: '100vh', background: '#080a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <RefreshCw className="animate-spin" size={32} style={{ color: '#4DB8CC' }} />
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#080a0f', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      fontFamily: 'var(--font-inter), sans-serif',
      overflow: 'hidden'
    }}>
      <style>{`
        .pin-input {
          width: 50px;
          height: 60px;
          border-radius: 12px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.03);
          color: white;
          font-size: 24px;
          font-weight: 700;
          text-align: center;
          outline: none;
          transition: all 0.2s ease;
        }
        .pin-input:focus {
          border-color: #4DB8CC !important;
          box-shadow: 0 0 15px rgba(77, 184, 204, 0.4) !important;
          background: rgba(255, 255, 255, 0.07) !important;
        }
        .verify-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(77, 184, 204, 0.4) !important;
          filter: brightness(1.15);
        }
        .verify-button:active:not(:disabled) {
          transform: translateY(1px);
        }
        .back-link:hover {
          color: white !important;
          opacity: 1 !important;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15%, 45%, 75% { transform: translateX(-8px); }
          30%, 60%, 90% { transform: translateX(8px); }
        }
        .shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>

      {/* Orbs */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-150px', left: '-100px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,78,100,0.4) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '-150px', right: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,201,126,0.25) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div className={shake ? 'shake' : ''} style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '28px',
        padding: '48px 36px',
        width: '100%',
        maxWidth: '460px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10,
        boxSizing: 'border-box'
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '28px' }}>
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt="NestKH Logo" 
              style={{ width: '64px', height: '64px', borderRadius: '16px', objectFit: 'cover', marginBottom: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
              onError={(e) => {
                // Hide if error and fallback to text
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : null}
          <p style={{ color: 'white', fontWeight: '900', fontSize: '28px', margin: 0, letterSpacing: '-0.5px' }}>
            NestKH<span style={{ color: '#4DB8CC' }}>.</span>
          </p>
          <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#4DB8CC', background: 'rgba(77, 184, 204, 0.12)', padding: '3px 10px', borderRadius: '9999px', marginTop: '6px' }}>ADMIN SECURITY</span>
        </div>

        {/* Form Title */}
        <h1 style={{ color: 'white', fontSize: '22px', fontWeight: '800', margin: '0 0 8px 0' }}>Admin Verification</h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px', margin: '0 0 32px 0', fontWeight: '400' }}>
          Enter your 6-character PIN to continue
        </p>

        {/* Error message */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: '#f87171',
            padding: '12px 16px',
            borderRadius: '14px',
            fontSize: '13px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textAlign: 'left'
          }}>
            {lockedOut ? <Lock size={16} style={{ flexShrink: 0 }} /> : <ShieldAlert size={16} style={{ flexShrink: 0 }} />}
            <div>
              <p style={{ margin: 0, fontWeight: '600' }}>{error}</p>
              {lockedOut && (
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', opacity: 0.8 }}>
                  Lockout expires in {formatRemainingTime(remainingTime)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Inputs */}
        <form onSubmit={handleVerify}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '32px' }}>
            {pin.map((char, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                maxLength={1}
                value={char}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={index === 0 ? handlePaste : undefined}
                disabled={lockedOut || loading}
                className="pin-input"
                autoComplete="off"
                data-testid={`pin-input-${index}`}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={lockedOut || loading || pin.join('').length !== 6}
            className="verify-button"
            style={{
              width: '100%',
              padding: '14px 20px',
              borderRadius: '9999px',
              border: 'none',
              background: lockedOut 
                ? 'rgba(255, 255, 255, 0.08)' 
                : 'linear-gradient(135deg, #004E64 0%, #4DB8CC 100%)',
              color: lockedOut ? 'rgba(255, 255, 255, 0.3)' : 'white',
              fontWeight: '700',
              fontSize: '15px',
              cursor: lockedOut || loading || pin.join('').length !== 6 ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: lockedOut ? 'none' : '0 4px 15px rgba(77, 184, 204, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxSizing: 'border-box'
            }}
          >
            {loading ? (
              <>
                <RefreshCw className="animate-spin" size={16} />
                Verifying...
              </>
            ) : lockedOut ? (
              <>
                <Lock size={16} />
                Locked Out ({formatRemainingTime(remainingTime)})
              </>
            ) : (
              'Verify PIN'
            )}
          </button>
        </form>

        <div style={{ marginTop: '28px' }}>
          <Link href="/" style={{ 
            color: 'rgba(255, 255, 255, 0.4)', 
            fontSize: '13px', 
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'color 0.2s ease',
            opacity: 0.8
          }} className="back-link">
            <ArrowLeft size={14} />
            Back to Site
          </Link>
        </div>
      </div>
    </div>
  )
}
