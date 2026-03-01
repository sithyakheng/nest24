'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
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
        <h1 className="text-3xl font-black text-white mb-2">Join NestKH</h1>
        <p className="text-white/50 font-light mb-6">
          Create your account
        </p>

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
            I'm a Buyer
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
            I'm a Seller
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
            placeholder="Full Name"
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
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-white/40 text-sm text-center mt-6">
          Already have an account?{' '}
          <Link href="/login" 
            className="text-teal-400 hover:text-teal-300">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
