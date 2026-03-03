'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function RanksPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [pendingRequest, setPendingRequest] = useState<any>(null)
  const [selectedRank, setSelectedRank] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (profile?.role !== 'seller') { router.push('/'); return }
      setUser(user)
      setProfile(profile)
      const { data: request } = await supabase
        .from('rank_requests')
        .select('*')
        .eq('seller_id', user.id)
        .eq('status', 'pending')
        .maybeSingle()
      setPendingRequest(request)
      setLoading(false)
    }
    load()
  }, [])

  async function submitRequest() {
    if (!selectedRank || !user) return
    const { error } = await supabase
      .from('rank_requests')
      .insert({ seller_id: user.id, rank: selectedRank, status: 'pending' })
    if (!error) {
      setSubmitted(true)
      setPendingRequest({ rank: selectedRank, status: 'pending' })
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#080a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)' }}>
      Loading...
    </div>
  )

  const ranks = [
    {
      id: 'starter',
      name: 'Starter',
      emoji: '🥉',
      price: '$5/month',
      color: '#93c5fd',
      glow: 'rgba(59,130,246,0.3)',
      border: 'rgba(59,130,246,0.4)',
      bg: 'rgba(59,130,246,0.1)',
      benefits: ['Blue badge on all products', 'Above unranked sellers', 'Trusted seller indicator']
    },
    {
      id: 'verified',
      name: 'Verified',
      emoji: '✓',
      price: '$15/month',
      color: '#4DB8CC',
      glow: 'rgba(0,78,100,0.4)',
      border: 'rgba(0,78,100,0.6)',
      bg: 'rgba(0,78,100,0.15)',
      popular: true,
      benefits: ['Teal badge on all products', 'Above Starter sellers', 'Featured in Trending Sellers', 'Priority in search results']
    },
    {
      id: 'premium',
      name: 'Premium',
      emoji: '⭐',
      price: '$30/month',
      color: '#E8C97E',
      glow: 'rgba(232,201,126,0.3)',
      border: 'rgba(232,201,126,0.5)',
      bg: 'rgba(232,201,126,0.1)',
      benefits: ['Gold badge on all products', 'Top of all listings', 'Featured on homepage', 'Maximum visibility']
    }
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#080a0f', paddingTop: '100px', paddingBottom: '60px', position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-150px', left: '-100px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,78,100,0.4) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '-150px', right: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,201,126,0.25) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>

        <Link href="/dashboard">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '32px', cursor: 'pointer' }}>
            ← Back to Dashboard
          </div>
        </Link>

        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>SELLER RANKS</p>
          <h1 style={{ color: 'white', fontSize: '42px', fontWeight: '900', margin: '0 0 12px 0' }}>Boost Your Shop 🚀</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px', fontWeight: '300' }}>Get a rank badge and make your products stand out</p>
        </div>

        {profile?.rank && profile.rank !== 'none' && (
          <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.12)', borderTop: '1px solid rgba(255,255,255,0.22)', borderRadius: '20px', padding: '20px 28px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '32px' }}>{profile.rank === 'premium' ? '⭐' : profile.rank === 'verified' ? '✓' : '🥉'}</span>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Current Rank</p>
              <p style={{ color: 'white', fontWeight: '800', fontSize: '20px', margin: '4px 0 0 0' }}>{profile.rank.charAt(0).toUpperCase() + profile.rank.slice(1)}</p>
            </div>
          </div>
        )}

        {pendingRequest && (
          <div style={{ background: 'rgba(232,201,126,0.1)', border: '1px solid rgba(232,201,126,0.3)', borderRadius: '16px', padding: '16px 24px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '20px' }}>⏳</span>
            <p style={{ color: '#E8C97E', fontWeight: '600', margin: 0 }}>You have a pending {pendingRequest.rank} rank request. We will review within 24 hours.</p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {ranks.map(rank => (
            <div key={rank.id}
              onClick={() => setSelectedRank(rank.id)}
              style={{ background: selectedRank === rank.id ? rank.bg : 'rgba(255,255,255,0.06)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: `1px solid ${selectedRank === rank.id ? rank.border : 'rgba(255,255,255,0.12)'}`, borderTop: `1px solid ${selectedRank === rank.id ? rank.border : 'rgba(255,255,255,0.22)'}`, borderRadius: '24px', padding: '28px', position: 'relative', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: selectedRank === rank.id ? `0 0 40px ${rank.glow}` : 'none' }}
            >
              {rank.popular && (
                <span style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #E8C97E, #F0B429)', color: 'black', fontSize: '11px', fontWeight: '800', padding: '4px 16px', borderRadius: '9999px', whiteSpace: 'nowrap' }}>
                  MOST POPULAR
                </span>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '36px' }}>{rank.emoji}</span>
                <span style={{ background: rank.bg, border: `1px solid ${rank.border}`, color: rank.color, fontSize: '13px', fontWeight: '700', padding: '4px 14px', borderRadius: '9999px' }}>{rank.price}</span>
              </div>
              <h3 style={{ color: rank.color, fontSize: '24px', fontWeight: '900', margin: '0 0 16px 0' }}>{rank.name}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                {rank.benefits.map((benefit, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: rank.color, fontSize: '12px', marginTop: '2px', flexShrink: 0 }}>✓</span>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>{benefit}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedRank(rank.id) }}
                style={{ width: '100%', padding: '12px', borderRadius: '9999px', border: `1px solid ${rank.border}`, background: selectedRank === rank.id ? rank.bg : 'transparent', color: rank.color, fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
              >
                {selectedRank === rank.id ? '✓ Selected' : 'Get ' + rank.name}
              </button>
            </div>
          ))}
        </div>

        {selectedRank && !pendingRequest && (
          <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.12)', borderTop: '1px solid rgba(255,255,255,0.22)', borderRadius: '24px', padding: '40px', textAlign: 'center' }}>
            <h2 style={{ color: 'white', fontSize: '24px', fontWeight: '900', margin: '0 0 8px 0' }}>How to get your {selectedRank} rank</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '32px' }}>Scan the QR code to pay then submit your request</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap', marginBottom: '32px' }}>
              {['Scan QR and Pay', 'Wait up to 24hrs', 'Rank activated!'].map((step, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(0,78,100,0.3)', border: '1px solid rgba(0,78,100,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4DB8CC', fontWeight: '900', fontSize: '18px', margin: '0 auto 10px auto' }}>{i + 1}</div>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: 0 }}>{step}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'inline-block', background: 'white', padding: '16px', borderRadius: '16px', marginBottom: '24px' }}>
              <img src={'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=NestKH-' + selectedRank + '-' + user?.id} alt="Payment QR" style={{ display: 'block', borderRadius: '8px' }} />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '24px' }}>Scan this QR code to pay for your {selectedRank} rank</p>
            {submitted ? (
              <div style={{ background: 'rgba(0,200,100,0.1)', border: '1px solid rgba(0,200,100,0.3)', borderRadius: '14px', padding: '16px 24px', color: '#4ade80', fontWeight: '600' }}>
                Request submitted! We will review within 24 hours.
              </div>
            ) : (
              <button onClick={submitRequest} style={{ background: 'linear-gradient(135deg, #E8C97E, #F0B429)', color: 'black', fontWeight: '800', fontSize: '15px', borderRadius: '9999px', padding: '14px 40px', border: 'none', cursor: 'pointer', width: '100%', maxWidth: '400px' }}>
                I have Paid — Submit Request
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
