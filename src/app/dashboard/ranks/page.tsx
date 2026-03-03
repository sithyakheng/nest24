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
    <div style={{ minHeight: '100vh', background: '#080a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '16px' }}>
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
      benefits: [
        'Blue badge on all your products',
        'Products appear above unranked sellers',
        'Trusted seller indicator on profile',
        'Basic profile highlight'
      ]
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
      benefits: [
        'Teal Verified badge on all products',
        'Products appear above Starter sellers',
        'Featured in Trending Sellers section',
        'Priority in search results',
        'Verified checkmark on public profile'
      ]
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
      benefits: [
        'Gold Premium badge on all products',
        'Products appear at the very top',
        'Featured on homepage spotlight',
        'Maximum visibility to all buyers',
        'Gold border on public profile'
      ]
    }
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#080a0f', paddingTop: '100px', paddingBottom: '80px', position: 'relative' }}>

      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-150px', left: '-100px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,78,100,0.4) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '-150px', right: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,201,126,0.25) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', top: '40%', left: '35%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(120,60,220,0.12) 0%, transparent 70%)', filter: 'blur(100px)' }} />
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>

        <Link href="/dashboard">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '40px', cursor: 'pointer' }}>
            ← Back to Dashboard
          </div>
        </Link>

        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <span style={{ display: 'inline-block', background: 'rgba(0,78,100,0.3)', border: '1px solid rgba(0,78,100,0.5)', color: '#4DB8CC', fontSize: '12px', fontWeight: '600', padding: '6px 16px', borderRadius: '9999px', marginBottom: '20px', letterSpacing: '0.05em' }}>
            🏆 SELLER RANKS
          </span>
          <h1 style={{ color: 'white', fontSize: '48px', fontWeight: '900', margin: '0 0 16px 0', lineHeight: 1.1 }}>
            Boost Your Shop
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '18px', fontWeight: '300', maxWidth: '500px', margin: '0 auto' }}>
            Buy a rank to get a badge on your products and stand out to buyers
          </p>
        </div>

        {profile?.rank && profile.rank !== 'none' && (
          <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.12)', borderTop: '1px solid rgba(255,255,255,0.22)', borderRadius: '20px', padding: '20px 28px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '36px' }}>{profile.rank === 'premium' ? '⭐' : profile.rank === 'verified' ? '✓' : '🥉'}</span>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px 0' }}>Your Current Rank</p>
              <p style={{ color: 'white', fontWeight: '900', fontSize: '22px', margin: 0 }}>
                {profile.rank.charAt(0).toUpperCase() + profile.rank.slice(1)}
              </p>
            </div>
          </div>
        )}

        {pendingRequest && (
          <div style={{ background: 'rgba(232,201,126,0.08)', border: '1px solid rgba(232,201,126,0.25)', borderRadius: '16px', padding: '18px 24px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>⏳</span>
            <div>
              <p style={{ color: '#E8C97E', fontWeight: '700', margin: '0 0 2px 0' }}>Rank Request Pending</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: 0 }}>
                Your {pendingRequest.rank} rank request is being reviewed. We will approve within 24 hours.
              </p>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '48px' }}>
          {ranks.map(rank => (
            <div
              key={rank.id}
              onClick={() => !pendingRequest && setSelectedRank(rank.id)}
              style={{
                background: selectedRank === rank.id ? rank.bg : 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: `1px solid ${selectedRank === rank.id ? rank.border : 'rgba(255,255,255,0.12)'}`,
                borderTop: `1px solid ${selectedRank === rank.id ? rank.border : 'rgba(255,255,255,0.22)'}`,
                borderRadius: '24px',
                padding: '32px',
                position: 'relative',
                cursor: pendingRequest ? 'default' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: selectedRank === rank.id ? `0 0 50px ${rank.glow}` : '0 8px 32px rgba(0,0,0,0.3)'
              }}
            >
              {rank.popular && (
                <span style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #E8C97E, #F0B429)', color: 'black', fontSize: '11px', fontWeight: '900', padding: '5px 18px', borderRadius: '9999px', whiteSpace: 'nowrap', letterSpacing: '0.05em' }}>
                  MOST POPULAR
                </span>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <span style={{ fontSize: '40px' }}>{rank.emoji}</span>
                <span style={{ background: rank.bg, border: `1px solid ${rank.border}`, color: rank.color, fontSize: '13px', fontWeight: '700', padding: '5px 14px', borderRadius: '9999px' }}>
                  {rank.price}
                </span>
              </div>

              <h3 style={{ color: rank.color, fontSize: '26px', fontWeight: '900', margin: '0 0 20px 0' }}>
                {rank.name}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                {rank.benefits.map((benefit, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ color: rank.color, fontSize: '13px', marginTop: '1px', flexShrink: 0, fontWeight: '700' }}>✓</span>
                    <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '14px', lineHeight: '1.4' }}>{benefit}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); if (!pendingRequest) setSelectedRank(rank.id) }}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '9999px',
                  border: `1px solid ${rank.border}`,
                  background: selectedRank === rank.id ? rank.bg : 'transparent',
                  color: rank.color,
                  fontWeight: '700',
                  fontSize: '15px',
                  cursor: pendingRequest ? 'default' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {selectedRank === rank.id ? '✓ Selected' : 'Get ' + rank.name}
              </button>
            </div>
          ))}
        </div>

        {selectedRank && !pendingRequest && (
          <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.12)', borderTop: '1px solid rgba(255,255,255,0.22)', borderRadius: '24px', padding: '48px', textAlign: 'center' }}>

            <h2 style={{ color: 'white', fontSize: '28px', fontWeight: '900', margin: '0 0 8px 0' }}>
              Get Your {selectedRank.charAt(0).toUpperCase() + selectedRank.slice(1)} Rank
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '40px', fontSize: '15px' }}>
              Follow these 3 simple steps
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', flexWrap: 'wrap', marginBottom: '40px' }}>
              {['Scan QR and Pay', 'Wait up to 24hrs', 'Rank activated!'].map((step, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(0,78,100,0.3)', border: '2px solid rgba(0,78,100,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4DB8CC', fontWeight: '900', fontSize: '20px', margin: '0 auto 12px auto' }}>
                    {i + 1}
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: 0 }}>{step}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'inline-block', background: 'white', padding: '20px', borderRadius: '20px', marginBottom: '20px', boxShadow: '0 0 40px rgba(232,201,126,0.2)' }}>
              <img
                src={'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=NestKH-' + selectedRank + '-' + user?.id}
                alt="Payment QR Code"
                style={{ display: 'block', borderRadius: '10px' }}
              />
            </div>

            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginBottom: '32px' }}>
              Scan this QR code to pay for your {selectedRank} rank
            </p>

            {submitted ? (
              <div style={{ background: 'rgba(0,200,100,0.1)', border: '1px solid rgba(0,200,100,0.3)', borderRadius: '16px', padding: '20px 28px', color: '#4ade80', fontWeight: '700', fontSize: '16px' }}>
                ✅ Request submitted! We will review within 24 hours.
              </div>
            ) : (
              <button
                onClick={submitRequest}
                style={{ background: 'linear-gradient(135deg, #E8C97E, #F0B429)', color: 'black', fontWeight: '900', fontSize: '16px', borderRadius: '9999px', padding: '16px 48px', border: 'none', cursor: 'pointer', width: '100%', maxWidth: '420px', boxShadow: '0 8px 24px rgba(232,201,126,0.3)' }}
              >
                I have Paid — Submit Request ✓
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
