'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Crown, Star, Shield, Upload, CheckCircle, AlertCircle } from 'lucide-react'

function BuyRankContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [selectedRank, setSelectedRank] = useState<string>('')
  const [showPayment, setShowPayment] = useState(false)
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  
  // Form states
  const [gmail, setGmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [shopName, setShopName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const rankTiers = [
    {
      id: 'elite',
      name: 'Elite',
      emoji: '🥉',
      price: '$15/month',
      color: '#93c5fd',
      bg: 'rgba(59,130,246,0.1)',
      border: 'rgba(59,130,246,0.3)',
      description: 'Lower premium tier - Basic visibility boost',
      icon: Shield
    },
    {
      id: 'premier',
      name: 'Premier',
      emoji: '✓',
      price: '$30/month',
      color: '#4DB8CC',
      bg: 'rgba(0,78,100,0.15)',
      border: 'rgba(0,78,100,0.4)',
      description: 'Middle tier - Enhanced visibility',
      icon: Star
    },
    {
      id: 'crown',
      name: 'Crown',
      emoji: '👑',
      price: '$50/month',
      color: '#E8C97E',
      bg: 'rgba(232,201,126,0.1)',
      border: 'rgba(232,201,126,0.3)',
      description: 'Top tier - Maximum visibility',
      icon: Crown
    }
  ]

  useEffect(() => {
    async function loadSellerData() {
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

      // Fetch seller's products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })

      setProducts(productsData || [])

      // Fetch pending requests
      const { data: requests } = await supabase
        .from('rank_payments')
        .select('*')
        .eq('seller_id', user.id)
        .eq('status', 'pending')

      setPendingRequests(requests || [])
      setLoading(false)
    }
    loadSellerData()
  }, [router])

  const handleRankSelect = (product: any, rankId: string) => {
    // Check if there's already a pending request for this product
    const hasPending = pendingRequests.some(req => req.product_id === product.id)
    if (hasPending) {
      setError('You already have a pending request for this product. Please wait for admin approval.')
      return
    }

    setSelectedProduct(product)
    setSelectedRank(rankId)
    setShowPayment(true)
    setError('')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file (JPG, PNG, etc.)')
        return
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB')
        return
      }
      setScreenshot(file)
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!gmail || !fullName || !shopName || !phoneNumber || !screenshot) {
      setError('Please fill all fields and upload a screenshot')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(gmail)) {
      setError('Please enter a valid Gmail address')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      // Upload screenshot to Supabase storage
      const fileName = `rank-payment-${user.id}-${Date.now()}.jpg`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('rank-payments')
        .upload(fileName, screenshot, {
          contentType: 'image/jpeg'
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('rank-payments')
        .getPublicUrl(fileName)

      // Save payment request to database
      const { data: paymentData, error: paymentError } = await supabase
        .from('rank_payments')
        .insert({
          seller_id: user.id,
          product_id: selectedProduct.id,
          rank: selectedRank,
          gmail,
          full_name: fullName,
          shop_name: shopName,
          phone_number: phoneNumber,
          screenshot_url: publicUrl,
          status: 'pending'
        })
        .select()
        .single()

      if (paymentError) throw paymentError

      setSubmitted(true)
      setSubmitting(false)
    } catch (error: any) {
      console.error('Payment submission error:', error)
      setError(error.message || 'Failed to submit payment. Please try again.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#080a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.4)' }}>Loading your products...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080a0f', paddingTop: '100px', paddingBottom: '60px', position: 'relative' }}>
      
      {/* Background Orbs */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-150px', left: '-100px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,78,100,0.4) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '-150px', right: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,201,126,0.25) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ color: 'white', fontSize: '42px', fontWeight: '900', margin: '0 0 12px 0' }}>
            Buy Premium Rank 🏆
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px', fontWeight: '300' }}>
            Select a product and choose your premium rank tier
          </p>
        </div>

        {/* Back button */}
        <Link href="/seller-dashboard">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '32px', cursor: 'pointer' }}>
            <ArrowLeft size={16} />
            Back to Dashboard
          </div>
        </Link>

        {products.length === 0 ? (
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '24px',
            padding: '60px',
            textAlign: 'center'
          }}>
            <h3 style={{ color: 'white', fontSize: '24px', fontWeight: '700', margin: '0 0 16px 0' }}>
              No Products Found
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '16px', lineHeight: '1.5' }}>
              You need to have at least one product to buy a premium rank.
            </p>
            <Link href="/seller-dashboard/add-product">
              <motion.button
                style={{
                  background: 'linear-gradient(135deg, #E8C97E, #F0B429)',
                  color: 'black',
                  fontWeight: '800',
                  fontSize: '16px',
                  borderRadius: '12px',
                  padding: '16px 32px',
                  border: 'none',
                  cursor: 'pointer',
                  marginTop: '24px'
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Add Your First Product
              </motion.button>
            </Link>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div style={{ marginBottom: '48px' }}>
              <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>
                Your Products
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      backdropFilter: 'blur(24px)',
                      WebkitBackdropFilter: 'blur(24px)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '20px',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Product Image */}
                    <div style={{ height: '160px', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {product.image_url ? (
                        <img
                          src={product.image_url.startsWith('http') 
                            ? product.image_url 
                            : `https://oisdppgqifhbtlanglwr.supabase.co/storage/v1/object/public/Product/${product.image_url}`
                          }
                          alt={product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '14px' }}>No Image</div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div style={{ padding: '20px' }}>
                      <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '700', margin: '0 0 8px 0', lineHeight: '1.3' }}>
                        {product.name}
                      </h3>
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: '0 0 16px 0', lineHeight: '1.4' }}>
                        {product.description?.substring(0, 100)}{product.description?.length > 100 ? '...' : ''}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ color: '#E8C97E', fontSize: '18px', fontWeight: '800' }}>
                          ${product.price}
                        </span>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '9999px',
                          fontSize: '12px',
                          fontWeight: '600',
                          background: product.stock > 0 ? 'rgba(0,200,100,0.2)' : 'rgba(255,80,80,0.2)',
                          color: product.stock > 0 ? '#4ade80' : '#f87171'
                        }}>
                          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Rank Selection */}
            <div>
              <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>
                Select Rank Tier
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {rankTiers.map((tier, index) => (
                  <motion.div
                    key={tier.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    style={{
                      background: tier.bg,
                      border: `1px solid ${tier.border}`,
                      borderRadius: '20px',
                      padding: '24px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                      <div style={{
                        width: '48px', height: '48px',
                        background: tier.border,
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: tier.color
                      }}>
                        <tier.icon size={24} />
                      </div>
                      <div>
                        <h3 style={{ color: tier.color, fontSize: '20px', fontWeight: '900', margin: '0 0 4px 0' }}>
                          {tier.name}
                        </h3>
                        <p style={{ color: tier.color, fontSize: '16px', fontWeight: '700', margin: 0 }}>
                          {tier.price}
                        </p>
                      </div>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.4', margin: '0 0 16px 0' }}>
                      {tier.description}
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {products.map((product) => {
                        const hasPending = pendingRequests.some(req => req.product_id === product.id)
                        return (
                          <motion.button
                            key={product.id}
                            onClick={() => handleRankSelect(product, tier.id)}
                            disabled={hasPending}
                            style={{
                              background: hasPending ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                              border: hasPending ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.2)',
                              color: hasPending ? 'rgba(255,255,255,0.3)' : 'white',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: hasPending ? 'not-allowed' : 'pointer',
                              transition: 'all 0.2s',
                              opacity: hasPending ? 0.5 : 1
                            }}
                            whileHover={{ scale: hasPending ? 1 : 1.05, background: hasPending ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.2)' }}
                            whileTap={{ scale: hasPending ? 1 : 0.95 }}
                          >
                            {hasPending ? 'Pending' : (product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name)}
                          </motion.button>
                        )
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Payment Modal */}
        {showPayment && selectedProduct && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{
              background: '#080a0f',
              borderRadius: '24px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid rgba(255,255,255,0.12)'
            }}>
              {submitted ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <CheckCircle size={64} color="#4ade80" style={{ margin: '0 auto 24px' }} />
                  <h2 style={{ color: 'white', fontSize: '24px', fontWeight: '800', margin: '0 0 16px 0' }}>
                    Payment Received!
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px', lineHeight: '1.5', margin: '0 0 32px 0' }}>
                    Admin will review your request. Rank will be activated within 24 hours if approved.
                  </p>
                  <button
                    onClick={() => {
                      setShowPayment(false)
                      setSubmitted(false)
                      setSelectedProduct(null)
                      setSelectedRank('')
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #E8C97E, #F0B429)',
                      color: 'black',
                      fontWeight: '800',
                      fontSize: '16px',
                      borderRadius: '12px',
                      padding: '16px 32px',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '800', margin: 0 }}>
                        Complete Payment
                      </h2>
                      <button
                        onClick={() => setShowPayment(false)}
                        style={{ color: 'rgba(255,255,255,0.5)', fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  <div style={{ padding: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                      
                      {/* Left - Product & Rank Info */}
                      <div>
                        <div style={{
                          background: 'rgba(255,255,255,0.06)',
                          borderRadius: '16px',
                          padding: '20px',
                          marginBottom: '24px'
                        }}>
                          <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '700', margin: '0 0 12px 0' }}>
                            Product Details
                          </h3>
                          <p style={{ color: 'white', fontWeight: '600', margin: '0 0 8px 0' }}>
                            {selectedProduct.name}
                          </p>
                          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: 0 }}>
                            {selectedProduct.description?.substring(0, 100)}{selectedProduct.description?.length > 100 ? '...' : ''}
                          </p>
                        </div>

                        <div style={{
                          background: rankTiers.find(t => t.id === selectedRank)?.bg,
                          border: `1px solid ${rankTiers.find(t => t.id === selectedRank)?.border}`,
                          borderRadius: '16px',
                          padding: '20px',
                          textAlign: 'center'
                        }}>
                          <div style={{ fontSize: '48px', marginBottom: '12px' }}>
                            {rankTiers.find(t => t.id === selectedRank)?.emoji}
                          </div>
                          <h3 style={{ color: rankTiers.find(t => t.id === selectedRank)?.color, fontSize: '20px', fontWeight: '900', margin: '0 0 8px 0' }}>
                            {rankTiers.find(t => t.id === selectedRank)?.name}
                          </h3>
                          <p style={{ color: rankTiers.find(t => t.id === selectedRank)?.color, fontSize: '16px', fontWeight: '700', margin: '0 0 12px 0' }}>
                            {rankTiers.find(t => t.id === selectedRank)?.price}
                          </p>
                          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                            {rankTiers.find(t => t.id === selectedRank)?.description}
                          </p>
                        </div>
                      </div>

                      {/* Right - Payment Form */}
                      <div>
                        <div style={{
                          background: 'rgba(232,201,126,0.1)',
                          border: '1px solid rgba(232,201,126,0.3)',
                          borderRadius: '16px',
                          padding: '20px',
                          marginBottom: '24px'
                        }}>
                          <h3 style={{ color: '#E8C97E', fontSize: '16px', fontWeight: '700', margin: '0 0 16px 0' }}>
                            📸 Scan QR Code & Pay
                          </h3>
                          <div style={{
                            background: 'white',
                            padding: '16px',
                            borderRadius: '12px',
                            marginBottom: '16px',
                            display: 'inline-block'
                          }}>
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ABA-PAYMENT-${selectedRank}-${selectedProduct.id}-${user?.id}`}
                              alt="ABA QR Code"
                              style={{ display: 'block', borderRadius: '8px' }}
                            />
                          </div>
                          <div style={{ color: 'white', fontSize: '14px', lineHeight: '1.4' }}>
                            <p style={{ fontWeight: '700', margin: '0 0 8px 0' }}>ABA Account Details:</p>
                            <p style={{ margin: '0 0 4px 0' }}>Account Name: <strong>NestKH Official</strong></p>
                            <p style={{ margin: '0 0 16px 0' }}>Account Number: <strong>123-456-789</strong></p>
                            <p style={{ color: '#E8C97E', fontWeight: '700', margin: 0 }}>
                              ⚠️ After payment, upload screenshot and fill details below
                            </p>
                          </div>
                        </div>
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
