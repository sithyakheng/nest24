'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

export default function RanksPage() {
  const [rankedProducts, setRankedProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRankedProducts() {
      // Fetch products with seller ranks
      const { data, error } = await supabase
        .from('products')
        .select('*, profiles(id, name, full_name, avatar_url, rank)')
        .not('profiles.rank', 'is', null)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching ranked products:', error)
        return
      }

      // Sort by rank priority: Crown > Premier > Elite
      const rankOrder: Record<string, number> = { crown: 3, premier: 2, elite: 1 }
      const sorted = (data || []).sort((a, b) => 
        (rankOrder[b.profiles?.rank || ''] || 0) - (rankOrder[a.profiles?.rank || ''] || 0)
      )

      setRankedProducts(sorted)
      setLoading(false)
    }
    fetchRankedProducts()
  }, [])

  const getRankBadge = (rank: string) => {
    switch (rank) {
      case 'crown':
        return {
          emoji: '👑',
          color: '#E8C97E',
          bg: 'rgba(232,201,126,0.1)',
          border: 'rgba(232,201,126,0.3)',
          label: 'Crown'
        }
      case 'premier':
        return {
          emoji: '✓',
          color: '#4DB8CC',
          bg: 'rgba(0,78,100,0.15)',
          border: 'rgba(0,78,100,0.4)',
          label: 'Premier'
        }
      case 'elite':
        return {
          emoji: '🥉',
          color: '#93c5fd',
          bg: 'rgba(59,130,246,0.1)',
          border: 'rgba(59,130,246,0.3)',
          label: 'Elite'
        }
      default:
        return {
          emoji: '⭐',
          color: '#E8C97E',
          bg: 'rgba(232,201,126,0.1)',
          border: 'rgba(232,201,126,0.3)',
          label: 'Premium'
        }
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#080a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.4)' }}>Loading ranked products...</div>
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
            Premium Ranked Products 🏆
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px', fontWeight: '300' }}>
            Discover products from sellers with premium ranks
          </p>
        </div>

        {/* Back button */}
        <Link href="/">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '32px', cursor: 'pointer' }}>
            <ArrowLeft size={16} />
            Back to Shop
          </div>
        </Link>

        {rankedProducts.length === 0 ? (
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
              No Ranked Products Yet
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '16px', lineHeight: '1.5' }}>
              Sellers haven't purchased premium ranks yet. Check back soon!
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {rankedProducts.map((product, index) => {
              const badge = getRankBadge(product.profiles?.rank || '')
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderTop: '1px solid rgba(255,255,255,0.22)',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    cursor: 'pointer'
                  }}
                >
                  <Link href={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
                    {/* Product Image */}
                    <div style={{ height: '240px', background: 'rgba(255,255,255,0.04)', position: 'relative' }}>
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
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)' }}>
                          No Image
                        </div>
                      )}
                      
                      {/* Premium Badge */}
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: badge.bg,
                        border: `1px solid ${badge.border}`,
                        color: badge.color,
                        fontSize: '12px',
                        fontWeight: '700',
                        padding: '6px 12px',
                        borderRadius: '9999px',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <span>{badge.emoji}</span>
                        <span>{badge.label}</span>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div style={{ padding: '24px' }}>
                      <div style={{ marginBottom: '12px' }}>
                        <span style={{ color: '#4DB8CC', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                          {product.category}
                        </span>
                      </div>
                      
                      <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '700', margin: '0 0 8px 0', lineHeight: '1.3' }}>
                        {product.name}
                      </h3>
                      
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', lineHeight: '1.5', margin: '0 0 16px 0' }}>
                        {product.description?.substring(0, 120)}{product.description?.length > 120 ? '...' : ''}
                      </p>
                      
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <span style={{ color: '#E8C97E', fontSize: '24px', fontWeight: '900' }}>
                          ${product.price}
                        </span>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '9999px',
                          fontSize: '12px',
                          fontWeight: '600',
                          background: product.stock > 0 ? 'rgba(0,200,100,0.2)' : 'rgba(255,80,80,0.2)',
                          color: product.stock > 0 ? '#4ade80' : '#f87171'
                        }}>
                          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </span>
                      </div>

                      {/* Seller Info */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '32px', height: '32px',
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'rgba(255,255,255,0.6)', fontSize: '12px'
                          }}>
                            👤
                          </div>
                          <div>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: '0 0 2px 0' }}>
                              {product.profiles?.full_name || product.profiles?.name || 'Seller'}
                            </p>
                            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', margin: 0 }}>
                              Premium Seller
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
