'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

function PaymentSection({ selectedRank, user, profile, onSubmitted }: any) {
  const [sellerName, setSellerName] = useState('')
  const [shopName, setShopName] = useState('')
  const [phone, setPhone] = useState('')
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  function handleScreenshot(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setScreenshot(file)
    setScreenshotPreview(URL.createObjectURL(file))
  }

  async function handleSubmit() {
    if (!sellerName || !shopName || !phone || !screenshot) {
      setError('Please fill in all fields and upload your payment screenshot.')
      return
    }
    setUploading(true)
    setError('')

    // Upload screenshot to Supabase storage
    const fileExt = screenshot.name.split('.').pop()
    const fileName = `rank-payment-${user.id}-${Date.now()}.${fileExt}` 
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('Product')
      .upload(fileName, screenshot)

    if (uploadError) {
      setError('Failed to upload screenshot. Try again.')
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage
      .from('Product')
      .getPublicUrl(fileName)

    const screenshotUrl = urlData.publicUrl

    // Insert rank request with all info
    const { error: insertError } = await supabase
      .from('rank_requests')
      .insert({
        seller_id: user.id,
        rank: selectedRank,
        status: 'pending',
        screenshot_url: screenshotUrl,
        seller_name: sellerName,
        shop_name: shopName,
        phone: phone
      })

    if (insertError) {
      setError('Failed to submit request. Try again.')
      setUploading(false)
      return
    }

    setUploading(false)
    onSubmitted()
  }

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '12px',
    color: 'white',
    padding: '12px 16px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box' as const
  }

  return (
    <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.12)', borderTop: '1px solid rgba(255,255,255,0.22)', borderRadius: '24px', padding: '48px' }}>
      
      <h2 style={{ color: 'white', fontSize: '28px', fontWeight: '900', margin: '0 0 8px 0', textAlign: 'center' }}>
        Get Your {selectedRank.charAt(0).toUpperCase() + selectedRank.slice(1)} Rank
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '40px', fontSize: '15px', textAlign: 'center' }}>
        Scan: QR code, pay, then fill in your details below
      </p>

      {/* Steps */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', flexWrap: 'wrap', marginBottom: '40px' }}>
        {['Scan QR and Pay', 'Fill your details', 'Upload screenshot', 'Wait for approval'].map((step, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(0,78,100,0.3)', border: '2px solid rgba(0,78,100,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4DB8CC', fontWeight: '900', fontSize: '18px', margin: '0 auto 10px auto' }}>
              {i + 1}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: 0 }}>{step}</p>
          </div>
        ))}
      </div>

      {/* ABA QR Code */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
          ABA Bank — Scan to Pay
        </p>
        <div style={{ display: 'inline-block', background: 'white', padding: '20px', borderRadius: '20px', boxShadow: '0 0 40px rgba(232,201,126,0.2)' }}>
          <img
            src={'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=NestKH-ABA-Payment-' + selectedRank}
            alt="ABA Payment QR"
            style={{ display: 'block', borderRadius: '10px' }}
          />
        </div>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginTop: '12px' }}>
          Pay to {selectedRank === 'premium' ? '$30' : selectedRank === 'verified' ? '$15' : '$5'} fee to activate your rank
        </p>
      </div>

      {/* Form */}
      <div style={{ maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <div>
          <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
            Your Full Name
          </label>
          <input
            type="text"
            placeholder="Enter your full name"
            value={sellerName}
            onChange={e => setSellerName(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
            Shop Name
          </label>
          <input
            type="text"
            placeholder="Enter your shop name"
            value={shopName}
            onChange={e => setShopName(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
            Phone Number
          </label>
          <input
            type="text"
            placeholder="Enter your phone number"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
            Payment Screenshot
          </label>
          <div
            onClick={() => document.getElementById('screenshot-upload')?.click()}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: screenshotPreview ? '1px solid rgba(0,78,100,0.5)' : '2px dashed rgba(255,255,255,0.15)',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              overflow: 'hidden'
            }}
          >
            {screenshotPreview ? (
              <img src={screenshotPreview} alt="Screenshot preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', objectFit: 'contain' }} />
            ) : (
              <div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: '0 0 4px 0' }}>📸 Upload Payment Screenshot</p>
                <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px', margin: 0 }}>Click to browse or drag and drop</p>
              </div>
            )}
          </div>
          <input
            id="screenshot-upload"
            type="file"
            accept="image/*"
            onChange={handleScreenshot}
            style={{ display: 'none' }}
          />
        </div>

        {error && (
          <div style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.2)', borderRadius: '12px', padding: '12px 16px', color: '#f87171', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={uploading}
          style={{
            background: uploading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #E8C97E, #F0B429)',
            color: uploading ? 'rgba(255,255,255,0.4)' : 'black',
            fontWeight: '900',
            fontSize: '16px',
            borderRadius: '9999px',
            padding: '16px 48px',
            border: 'none',
            cursor: uploading ? 'not-allowed' : 'pointer',
            width: '100%',
            marginTop: '8px',
            boxShadow: uploading ? 'none' : '0 8px 24px rgba(232,201,126,0.3)',
            transition: 'all 0.2s'
          }}
        >
          {uploading ? 'Submitting...' : 'Submit Payment Request ✓'}
        </button>

      </div>
    </div>
  )
}

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
          <PaymentSection
            selectedRank={selectedRank}
            user={user}
            profile={profile}
            onSubmitted={() => {
              setSubmitted(true)
              setPendingRequest({ rank: selectedRank, status: 'pending' })
            }}
          />
        )}

      </div>
    </div>
  )
}
