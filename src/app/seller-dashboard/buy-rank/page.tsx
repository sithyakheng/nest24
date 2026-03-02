'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

function BuyRankContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedRank, setSelectedRank] = useState<string>('')
  const [productId, setProductId] = useState<string>('')
  const [product, setProduct] = useState<any>(null)
  const [pendingRequest, setPendingRequest] = useState<any>(null)
  
  // Form states
  const [gmail, setGmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [shopName, setShopName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const ranks = [
    {
      id: 'elite',
      name: 'Elite',
      emoji: '🥉',
      price: '$15/month',
      color: '#93c5fd',
      bg: 'rgba(59,130,246,0.1)',
      border: 'rgba(59,130,246,0.3)',
      description: 'Lower premium tier - Basic visibility boost'
    },
    {
      id: 'premier',
      name: 'Premier',
      emoji: '✓',
      price: '$30/month',
      color: '#4DB8CC',
      bg: 'rgba(0,78,100,0.15)',
      border: 'rgba(0,78,100,0.4)',
      description: 'Middle tier - Enhanced visibility'
    },
    {
      id: 'crown',
      name: 'Crown',
      emoji: '👑',
      price: '$50/month',
      color: '#E8C97E',
      bg: 'rgba(232,201,126,0.1)',
      border: 'rgba(232,201,126,0.3)',
      description: 'Top tier - Maximum visibility'
    }
  ]

  useEffect(() => {
    async function loadUserAndProduct() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!profile || profile.role !== 'seller') {
        router.push('/')
        return
      }

      setUser(user)
      setProfile(profile)
      setFullName(profile.full_name || profile.name || '')
      setShopName(profile.shop_name || '')

      // Get rank and product from URL params
      const rank = searchParams.get('rank')
      const product = searchParams.get('product')
      
      if (!rank || !product) {
        router.push('/seller-dashboard/buy-rank/select')
        return
      }

      setSelectedRank(rank)
      setProductId(product)

      // Validate product ownership
      const { data: productData } = await supabase
        .from('products')
        .select('*')
        .eq('id', product)
        .eq('seller_id', user.id)
        .single()

      if (!productData) {
        router.push('/seller-dashboard/products')
        return
      }

      setProduct(productData)

      // Check for existing pending request
      const { data: request } = await supabase
        .from('rank_payments')
        .select('*')
        .eq('seller_id', user.id)
        .eq('product_id', product)
        .eq('status', 'pending')
        .single()

      setPendingRequest(request)
      setLoading(false)
    }
    loadUserAndProduct()
  }, [router, searchParams])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setScreenshot(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!gmail || !fullName || !shopName || !phoneNumber || !screenshot || !selectedRank) {
      alert('Please fill all fields and upload payment screenshot')
      return
    }

    setSubmitting(true)

    try {
      // Upload screenshot
      const fileExt = screenshot.name.split('.').pop()
      const fileName = `payment-${Date.now()}.${fileExt}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('rank-payments')
        .upload(fileName, screenshot)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('rank-payments')
        .getPublicUrl(fileName)

      // Submit payment request
      const { error: submitError } = await supabase
        .from('rank_payments')
        .insert({
          seller_id: user.id,
          product_id: productId,
          rank: selectedRank,
          gmail,
          full_name: fullName,
          shop_name: shopName,
          phone_number: phoneNumber,
          screenshot_url: publicUrl,
          status: 'pending'
        })

      if (submitError) throw submitError

      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting payment:', error)
      alert('Error submitting payment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#080a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.4)' }}>Loading...</div>
      </div>
    )
  }

  const selectedRankData = ranks.find(r => r.id === selectedRank)

  return (
    <div style={{ minHeight: '100vh', background: '#080a0f', paddingTop: '100px', paddingBottom: '60px', position: 'relative' }}>
      
      {/* Background Orbs */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-150px', left: '-100px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,78,100,0.4) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '-150px', right: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,201,126,0.25) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>

        {/* Back button */}
        <Link href="/seller-dashboard">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '32px', cursor: 'pointer' }}>
            ← Back to Dashboard
          </div>
        </Link>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ color: 'white', fontSize: '42px', fontWeight: '900', margin: '0 0 12px 0' }}>
            Buy Premium Rank 🏆
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px', fontWeight: '300' }}>
            Boost your product visibility with ABA payment
          </p>
        </div>

        {submitted ? (
          /* Confirmation */
          <div style={{
            background: 'rgba(0,200,100,0.1)',
            border: '1px solid rgba(0,200,100,0.3)',
            borderRadius: '24px',
            padding: '40px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <h2 style={{ color: '#4ade80', fontSize: '24px', fontWeight: '800', margin: '0 0 8px 0' }}>
              Payment Received!
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px', lineHeight: '1.5' }}>
              Admin will review your request. Rank will be activated within 24 hours if approved.
            </p>
          </div>
        ) : (
          /* Payment Form */
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            
            {/* Left - Rank Selection & QR */}
            <div>
              {selectedRankData && product && (
                <div style={{
                  background: selectedRankData.bg,
                  border: `1px solid ${selectedRankData.border}`,
                  borderRadius: '24px',
                  padding: '32px',
                  marginBottom: '24px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '64px', marginBottom: '16px' }}>
                    {selectedRankData.emoji}
                  </div>
                  <h2 style={{ color: selectedRankData.color, fontSize: '32px', fontWeight: '900', margin: '0 0 8px 0' }}>
                    {selectedRankData.name}
                  </h2>
                  <p style={{ color: selectedRankData.color, fontSize: '20px', fontWeight: '700', margin: '0 0 16px 0' }}>
                    {selectedRankData.price}
                  </p>
                  <div style={{
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '16px'
                  }}>
                    <p style={{ color: 'white', fontWeight: '600', margin: '0 0 8px 0' }}>
                      Product: {product.name}
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: 0 }}>
                      {product.description?.substring(0, 100)}{product.description?.length > 100 ? '...' : ''}
                    </p>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                    {selectedRankData.description}
                  </p>
                </div>
              )}

              {/* ABA QR Code */}
              <div style={{
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '20px',
                padding: '24px',
                textAlign: 'center'
              }}>
                <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '700', margin: '0 0 16px 0' }}>
                  ABA Payment
                </h3>
                
                <div style={{
                  background: 'white',
                  padding: '16px',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  display: 'inline-block'
                }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ABA-PAYMENT-${selectedRank}-${productId}-${user?.id}`}
                    alt="ABA QR Code"
                    style={{ display: 'block', borderRadius: '8px' }}
                  />
                </div>

                <div style={{
                  background: 'rgba(232,201,126,0.1)',
                  border: '1px solid rgba(232,201,126,0.3)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '16px'
                }}>
                  <p style={{ color: '#E8C97E', fontWeight: '600', margin: '0 0 8px 0' }}>
                    ABA Account Details
                  </p>
                  <p style={{ color: 'white', fontSize: '14px', margin: '0' }}>
                    Account: NestKH Official<br />
                    Number: 123-456-789
                  </p>
                </div>

                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', lineHeight: '1.4' }}>
                  Scan QR, pay via ABA, then upload your payment screenshot. Fill your Gmail, name, shop name, and phone number. Wait up to 24 hours for confirmation.
                </p>
              </div>
            </div>

            {/* Right - Form */}
            <div>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Gmail */}
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                    Gmail Address *
                  </label>
                  <input
                    type="email"
                    value={gmail}
                    onChange={(e) => setGmail(e.target.value)}
                    placeholder="your.email@gmail.com"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'rgba(255,255,255,0.06)',
                      color: 'white',
                      fontSize: '14px'
                    }}
                  />
                </div>

                {/* Full Name */}
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'rgba(255,255,255,0.06)',
                      color: 'white',
                      fontSize: '14px'
                    }}
                  />
                </div>

                {/* Shop Name */}
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                    Shop Name *
                  </label>
                  <input
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="Your shop name"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'rgba(255,255,255,0.06)',
                      color: 'white',
                      fontSize: '14px'
                    }}
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+855 12 345 678"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'rgba(255,255,255,0.06)',
                      color: 'white',
                      fontSize: '14px'
                    }}
                  />
                </div>

                {/* Screenshot Upload */}
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                    Payment Screenshot *
                  </label>
                  <div style={{
                    border: '2px dashed rgba(255,255,255,0.3)',
                    borderRadius: '12px',
                    padding: '24px',
                    textAlign: 'center',
                    background: 'rgba(255,255,255,0.02)',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      required
                      style={{ display: 'none' }}
                      id="screenshot-upload"
                    />
                    <label htmlFor="screenshot-upload" style={{ cursor: 'pointer' }}>
                      {screenshot ? (
                        <div>
                          <img
                            src={URL.createObjectURL(screenshot)}
                            alt="Payment screenshot"
                            style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '8px', marginBottom: '8px' }}
                          />
                          <p style={{ color: '#4DB8CC', fontSize: '14px', margin: 0 }}>
                            {screenshot.name}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <div style={{
                            width: '48px', height: '48px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 8px auto'
                          }}>
                            <span style={{ fontSize: '24px' }}>📷</span>
                          </div>
                          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: 0 }}>
                            Click to upload payment screenshot
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: submitting ? 'rgba(255,255,255,0.2)' : 'linear-gradient(135deg, #E8C97E, #F0B429)',
                    color: 'black',
                    fontWeight: '800',
                    fontSize: '16px',
                    borderRadius: '12px',
                    padding: '16px',
                    border: 'none',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    width: '100%',
                    transition: 'all 0.2s'
                  }}
                >
                  {submitting ? 'Submitting...' : 'I Have Paid ✓'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function BuyRankPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#080a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.4)' }}>Loading...</div>
      </div>
    }>
      <BuyRankContent />
    </Suspense>
  )
}
