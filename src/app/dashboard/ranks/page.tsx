'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, Star, Medal } from 'lucide-react'
import { useMediaQuery } from '@/hooks/use-media-query'

function PaymentSection({ selectedRank, user, profile, onSubmitted }: {
  selectedRank: string
  user: any
  profile: any
  onSubmitted: () => void
}) {
  const [sellerName, setSellerName] = useState('')
  const [shopName, setShopName] = useState('')
  const [phone, setPhone] = useState('')
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function compressImage(file: File): Promise<File> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (e) => {
        const img = new Image()
        img.src = e.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          
          // Max width 1200px
          let width = img.width
          let height = img.height
          if (width > 1200) {
            height = Math.round((height * 1200) / width)
            width = 1200
          }
          
          canvas.width = width
          canvas.height = height
          
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File(
                  [blob], 
                  file.name.replace(/\.[^/.]+$/, '.webp'),
                  { type: 'image/webp' }
                )
                console.log(
                  `Compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB` 
                )
                resolve(compressedFile)
              } else {
                resolve(file)
              }
            },
            'image/webp',
            0.82
          )
        }
      }
    })
  }

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

    const { data: existing } = await supabase
      .from('rank_requests')
      .select('id')
      .eq('seller_id', user.id)
      .eq('status', 'pending')
      .maybeSingle()

    if (existing) {
      setError('You already have a pending request. Wait for admin approval.')
      return
    }

    setUploading(true)
    setError('')

    // Upload screenshot to Supabase storage with compression
    console.log('Compressing screenshot...')
    const compressed = await compressImage(screenshot)
    
    const fileName = `rank-payment-${user.id}-${Date.now()}.webp` 
    const { error: uploadError } = await supabase.storage
      .from('Product')
      .upload(fileName, compressed)

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
    <div id="payment-section" style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.12)', borderTop: '1px solid rgba(255,255,255,0.22)', borderRadius: '24px', padding: '48px' }}>
      
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
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '40px'
      }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
          Scan to Pay
        </p>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '12px',
          boxShadow: '0 0 40px rgba(232,201,126,0.2)'
        }}>
          <img
            src="https://oisdppgqifhbtlanglwr.supabase.co/storage/v1/object/public/Product/aba-qr.jpeg"
            alt="ABA Bank QR Code"
            style={{
              width: '200px',
              height: '200px',
              objectFit: 'contain',
              display: 'block',
              borderRadius: '8px'
            }}
          />
        </div>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0, textAlign: 'center' }}>
          Open ABA Mobile → Scan QR → Pay exact amount
        </p>
        <div style={{
          background: 'rgba(232,201,126,0.1)',
          border: '1px solid rgba(232,201,126,0.3)',
          borderRadius: '12px',
          padding: '10px 20px',
          textAlign: 'center'
        }}>
          <p style={{ color: '#E8C97E', fontWeight: '900', fontSize: '20px', margin: 0 }}>
            ${selectedRank === 'starter' ? '5' : selectedRank === 'verified' ? '15' : '30'} USD
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '4px 0 0 0' }}>
            {selectedRank === 'starter' ? 'Starter' : selectedRank === 'verified' ? 'Verified' : 'Premium'} Rank Payment
          </p>
        </div>
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
          {uploading ? 'Submitting...' : 'Submit Payment Request <Check size={12} />'}
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

  // Debug log for selectedRank
  console.log('selectedRank:', selectedRank)

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

  const isDesktop = useMediaQuery("(min-width: 768px)")

  const plans = [
    {
      id: 'starter',
      name: 'STARTER',
      price: 5,
      originalPrice: 6,
      period: 'per month',
      emoji: <Medal size={16} />,
      color: '#93c5fd',
      border: 'rgba(59,130,246,0.4)',
      bg: 'rgba(59,130,246,0.08)',
      isPopular: false,
      features: [
        'Blue badge on all your products',
        'Products appear above unranked sellers',
        'Appear in New Sellers section on homepage',
        'Basic seller profile highlight'
      ],
      description: 'Perfect for new sellers getting started',
      buttonText: 'Get Starter'
    },
    {
      id: 'verified',
      name: 'VERIFIED',
      price: 15,
      originalPrice: 19,
      period: 'per month',
      emoji: <Check size={16} />,
      color: '#4DB8CC',
      border: 'rgba(0,78,100,0.6)',
      bg: 'rgba(0,78,100,0.12)',
      isPopular: true,
      features: [
        'Teal Verified badge on all products',
        'Products appear above Starter sellers',
        'Featured in Trending Sellers on homepage',
        'Verified Seller tag on product detail page',
        'Buyers see trust checkmark when contacting you',
        'Profile shows verified since date'
      ],
      description: 'Ideal for growing sellers who want trust',
      buttonText: 'Get Verified'
    },
    {
      id: 'premium',
      name: 'PREMIUM',
      price: 30,
      originalPrice: 38,
      period: 'per month',
      emoji: <Star size={16} />,
      color: '#E8C97E',
      border: 'rgba(232,201,126,0.5)',
      bg: 'rgba(232,201,126,0.08)',
      isPopular: false,
      features: [
        'Gold Premium badge on all products',
        'Products at the very TOP of all listings',
        'Featured spotlight section on homepage',
        'Bold gold border around your product cards',
        'Premium Seller banner on your profile page',
        'Products show first in all category pages',
        'Gold username color in seller info',
        'Top Seller featured section on homepage'
      ],
      description: 'For serious sellers who want maximum visibility',
      buttonText: 'Get Premium'
    }
  ]

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#080a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '16px' }}>
      Loading...
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#080a0f', paddingTop: '100px', paddingBottom: '80px', position: 'relative' }}>

      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-150px', left: '-100px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,78,100,0.4) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '-150px', right: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,201,126,0.25) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', top: '40%', left: '35%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(120,60,220,0.12) 0%, transparent 70%)', filter: 'blur(100px)' }} />
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>

        {/* Back button */}
        <Link href="/dashboard">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '40px', cursor: 'pointer' }}>
            ← Back to Dashboard
          </div>
        </Link>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <span style={{ display: 'inline-block', background: 'rgba(0,78,100,0.3)', border: '1px solid rgba(0,78,100,0.5)', color: '#4DB8CC', fontSize: '12px', fontWeight: '600', padding: '6px 16px', borderRadius: '9999px', marginBottom: '20px', letterSpacing: '0.05em' }}>
            🏆 SELLER RANKS
          </span>
          <h1 style={{ color: 'white', fontSize: '48px', fontWeight: '900', margin: '0 0 16px 0', lineHeight: 1.1 }}>
            Boost Your Shop 🚀
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '18px', fontWeight: '300', maxWidth: '500px', margin: '0 auto' }}>
            Get a rank badge and make your products stand out
          </p>
        </div>

        {/* Current rank display */}
        {profile?.rank && profile.rank !== 'none' && (
          <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.12)', borderTop: '1px solid rgba(255,255,255,0.22)', borderRadius: '20px', padding: '20px 28px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '36px' }}>{profile.rank === 'premium' ? <Star size={32} /> : profile.rank === 'verified' ? <Check size={32} /> : <Medal size={32} />}</span>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px 0' }}>Your Current Rank</p>
              <p style={{ color: 'white', fontWeight: '900', fontSize: '22px', margin: 0 }}>
                {profile.rank.charAt(0).toUpperCase() + profile.rank.slice(1)}
              </p>
            </div>
          </div>
        )}

        {/* Pending request notice */}
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

        {/* NEW PRICING CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(3, 1fr)' : '1fr', gap: isDesktop ? '24px' : '16px', marginBottom: '48px', alignItems: isDesktop ? 'center' : 'stretch' }}>
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ y: 50, opacity: 0 }}
              animate={{ opacity: 1 }}
              whileInView={
                isDesktop ? {
                  y: plan.isPopular ? -20 : 0,
                  opacity: 1,
                  x: index === 2 ? -20 : index === 0 ? 20 : 0,
                  scale: index === 0 || index === 2 ? 0.95 : 1.0,
                } : {}
              }
              viewport={{ once: true }}
              transition={{
                duration: 1.6,
                type: 'spring',
                stiffness: 100,
                damping: 30,
                delay: index * 0.1
              }}
              onClick={() => setSelectedRank(plan.id)}
              style={{
                background: selectedRank === plan.id ? plan.bg : 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: `${plan.isPopular ? '2px' : '1px'} solid ${selectedRank === plan.id ? plan.border : plan.isPopular ? plan.border : 'rgba(255,255,255,0.12)'}`,
                borderRadius: '20px',
                padding: '32px 28px',
                position: 'relative',
                cursor: 'pointer',
                transition: 'box-shadow 0.3s ease, background 0.3s ease',
                boxShadow: selectedRank === plan.id ? `0 0 40px ${plan.bg}` : plan.isPopular ? `0 0 30px ${plan.bg}` : 'none',
                marginTop: plan.isPopular ? '0' : '20px'
              }}
            >
              {/* Popular badge */}
              {plan.isPopular && (
                <div style={{
                  position: 'absolute', top: '0', right: '0',
                  background: plan.color === '#4DB8CC' ? 'rgba(0,78,100,0.8)' : 'rgba(232,201,126,0.8)',
                  padding: '4px 12px',
                  borderRadius: '0 20px 0 12px',
                  display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                  <Star size={12} color={plan.color} fill={plan.color} />
                  <span style={{ color: plan.color, fontSize: '12px', fontWeight: '700' }}>Popular</span>
                </div>
              )}

              {/* Plan name */}
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: '600', letterSpacing: '0.1em', margin: '0 0 20px 0' }}>
                {plan.emoji} {plan.name}
              </p>

              {/* 20% OFF badge */}
              <span style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #f87171, #ef4444)',
                color: 'white',
                fontSize: '11px',
                fontWeight: '800',
                padding: '3px 10px',
                borderRadius: '9999px',
                marginBottom: '8px',
                letterSpacing: '0.05em'
              }}>
                20% OFF
              </span>

              {/* Original price crossed out */}
              <p style={{
                color: 'rgba(255,255,255,0.35)',
                fontSize: '16px',
                fontWeight: '600',
                margin: '0 0 4px 0',
                textDecoration: 'line-through'
              }}>
                ${plan.originalPrice}
              </p>

              {/* Real price */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', marginBottom: '4px' }}>
                <span style={{ color: plan.color, fontSize: '52px', fontWeight: '900', lineHeight: 1 }}>
                  ${plan.price}
                </span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '24px' }}>
                / {plan.period}
              </p>

              {/* Features */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                {plan.features.map((feature, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <Check size={14} color={plan.color} style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', lineHeight: '1.4', textAlign: 'left' }}>{feature}</span>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', marginBottom: '20px' }} />

              {/* Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedRank(plan.id)
                  setTimeout(() => {
                    document.getElementById('payment-section')?.scrollIntoView({ behavior: 'smooth' })
                  }, 100)
                }}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '12px',
                  border: `1px solid ${plan.border}`,
                  background: selectedRank === plan.id
                    ? plan.id === 'verified' ? 'rgba(0,78,100,0.5)' : plan.id === 'premium' ? 'rgba(232,201,126,0.3)' : 'rgba(59,130,246,0.3)'
                    : plan.isPopular ? plan.bg : 'transparent',
                  color: plan.color,
                  fontWeight: '700',
                  fontSize: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  letterSpacing: '0.02em'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = plan.bg
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = selectedRank === plan.id ? plan.bg : plan.isPopular ? plan.bg : 'transparent'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {selectedRank === plan.id ? '<Check size={12} /> Selected — Scroll to Pay' : plan.buttonText}
              </button>

              {/* Description */}
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', textAlign: 'center', marginTop: '16px', lineHeight: '1.5' }}>
                {plan.description}
              </p>

            </motion.div>
          ))}
        </div>

        {/* Payment Section */}
        {selectedRank && (
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
