'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { verifyPin } from '@/lib/pinHash'
import { supabase } from '@/lib/supabase'

export default function VerifyPinPage() {
  const router = useRouter()
  const [pinDigits, setPinDigits] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [lockoutTime, setLockoutTime] = useState(0)
  const [userProfile, setUserProfile] = useState<any>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    const timer = setInterval(() => {
      setLockoutTime(prev => {
        if (prev <= 1) {
          setWrongAttempts(0)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        const { data } = await supabase
          .from('profiles')
          .select('id, role, security_pin')
          .eq('id', user.id)
          .single()

        setUserProfile(data)

        if (!data?.security_pin) {
          router.push('/dashboard')
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
        router.push('/login')
      }
    }

    fetchProfile()
  }, [router])

  const handleInput = (index: number, value: string) => {
    if (lockoutTime > 0) return

    if (!/^\d*$/.test(value)) return

    const newDigits = [...pinDigits]
    newDigits[index] = value.slice(-1)
    setPinDigits(newDigits)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (lockoutTime > 0) return

    if (e.key === 'Backspace') {
      e.preventDefault()
      const newDigits = [...pinDigits]
      if (pinDigits[index]) {
        newDigits[index] = ''
        setPinDigits(newDigits)
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleVerify = async () => {
    const pin = pinDigits.join('')

    if (pin.length !== 6) {
      setError('Please enter all 6 digits')
      return
    }

    if (lockoutTime > 0) {
      setError(`Please wait ${lockoutTime} seconds before trying again`)
      return
    }

    setLoading(true)

    try {
      if (userProfile?.security_pin && verifyPin(pin, userProfile.security_pin)) {
        sessionStorage.setItem('seller_pin_verified', 'true')
        setError('')
        setTimeout(() => {
          router.push('/dashboard')
        }, 500)
      } else {
        const newAttempts = wrongAttempts + 1
        setWrongAttempts(newAttempts)

        if (newAttempts >= 3) {
          setLockoutTime(300)
          setError('Too many attempts. Please wait 5 minutes.')
          setPinDigits(['', '', '', '', '', ''])
        } else {
          setError(`Wrong PIN. ${3 - newAttempts} attempts remaining.`)
          setPinDigits(['', '', '', '', '', ''])
          inputRefs.current[0]?.focus()
        }
      }
    } catch (err) {
      console.error('Error verifying PIN:', err)
      setError('Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-white dot-grid-background flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dot-grid-background flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-[#004E64]">NestKH</h1>
      </div>

      {/* Title */}
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Seller Verification</h2>
      <p className="text-gray-600 mb-8">Enter your 6 digit security PIN</p>

      {/* PIN Input Boxes */}
      <div className="flex gap-3 mb-8">
        {pinDigits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleInput(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            disabled={lockoutTime > 0 || loading}
            className="w-14 h-14 text-2xl font-bold text-center border-2 border-gray-300 rounded-lg focus:border-[#0d9488] focus:outline-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="0"
          />
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 text-center">
          <p className="text-red-600 font-medium">{error}</p>
          {lockoutTime > 0 && (
            <p className="text-red-500 text-sm mt-1">Locked for {lockoutTime}s</p>
          )}
        </div>
      )}

      {/* Verify Button */}
      <button
        onClick={handleVerify}
        disabled={loading || lockoutTime > 0}
        className="w-full max-w-sm px-6 py-3 bg-[#0d9488] text-white font-bold rounded-lg hover:bg-[#0f766e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Verifying...' : 'Verify PIN'}
      </button>

      {/* Logout Link */}
      <button
        onClick={() => {
          supabase.auth.signOut()
          router.push('/login')
        }}
        className="mt-6 text-gray-600 hover:text-gray-900 text-sm underline"
      >
        Sign out
      </button>
    </div>
  )
}
