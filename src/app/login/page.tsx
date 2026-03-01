'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
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
    const role = data.user?.user_metadata?.role
    if (role === 'seller') {
      router.push('/seller-dashboard')
    } else {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen bg-[#080a0f] flex items-center justify-center px-4">
      <div style={{
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderTop: '1px solid rgba(255,255,255,0.22)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
        borderRadius: '24px',
        padding: '48px',
        width: '100%',
        maxWidth: '440px'
      }}>
        <h1 className="text-3xl font-black text-white mb-2">Welcome Back</h1>
        <p className="text-white/50 font-light mb-8">Sign in to NestKH</p>
        
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
            placeholder="Email"
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
            placeholder="Password"
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
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-white/40 text-sm text-center mt-6">
          Don't have an account?{' '}
          <Link href="/register" 
            className="text-teal-400 hover:text-teal-300">
            Join Free
          </Link>
        </p>
      </div>
    </div>
  )
}
