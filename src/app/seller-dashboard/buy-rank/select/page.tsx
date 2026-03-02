'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Crown, Star, Shield } from 'lucide-react'

function RankSelectionContent() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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
    async function loadSellerProducts() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || profile.role !== 'seller') {
        router.push('/')
        return
      }

      setUser(user)

      // Fetch seller's products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })

      setProducts(productsData || [])
      setLoading(false)
    }
    loadSellerProducts()
  }, [router])

  const handleRankSelect = (productId: string, rankId: string) => {
    router.push(`/seller-dashboard/buy-rank?product=${productId}&rank=${rankId}`)
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
            
            {/* Products Grid */}
            <div>
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
                      {products.map((product) => (
                        <motion.button
                          key={product.id}
                          onClick={() => handleRankSelect(product.id, tier.id)}
                          style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: 'white',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.2)' }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function RankSelectionPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#080a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.4)' }}>Loading...</div>
      </div>
    }>
      <RankSelectionContent />
    </Suspense>
  )
}
