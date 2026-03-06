'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { TrendingUp, Package, User } from 'lucide-react'
import Navbar from '@/components/Navbar'
import ProductCard from '@/components/ProductCard'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'

const getImageUrl = (image_url: string): string | null => {
  if (!image_url) return null
  if (image_url.startsWith('http')) return image_url
  return `https://oisdppgqifhbtlanglwr.supabase.co/storage/v1/object/public/Product/${image_url}` 
}

export default function HomePage() {
  const { t, lang } = useLang()
  const [products, setProducts] = useState<any[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [trendingSellers, setTrendingSellers] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [recentProducts, setRecentProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [premiumSellers, setPremiumSellers] = useState<any[]>([])
  const [topSellers, setTopSellers] = useState<any[]>([])
  const [newSellers, setNewSellers] = useState<any[]>([])
  const [windowWidth, setWindowWidth] = useState(1200)

  const isMobile = windowWidth < 768
  const isSmallMobile = windowWidth < 480

  useEffect(() => {
    setWindowWidth(window.innerWidth)
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
  fetchProducts()
  fetchSellers()
}, [])

async function fetchSellers() {
  // Load premium sellers for spotlight
  const { data: premiumSellersData } = await supabase
    .from('profiles')
    .select('*, products(id)')
    .eq('role', 'seller')
    .eq('rank', 'premium')
    .limit(3)
  setPremiumSellers(premiumSellersData || [])

  // Load top sellers (premium + verified)
  const { data: topSellersData } = await supabase
    .from('profiles')
    .select('*, products(id)')
    .eq('role', 'seller')
    .in('rank', ['premium', 'verified'])
    .limit(6)
  setTopSellers(topSellersData || [])

  // Load new sellers (starter)
  const { data: newSellersData } = await supabase
    .from('profiles')
    .select('*, products(id)')
    .eq('role', 'seller')
    .eq('rank', 'starter')
    .limit(4)
  setNewSellers(newSellersData || [])
}

async function fetchProducts() {
  setProductsLoading(true)
  
  const { data: productsData, error: productsError } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (productsError || !productsData) {
    console.error('Products error:', productsError)
    setProductsLoading(false)
    return
  }

  // Get unique seller ids
  const sellerIds = [...new Set(productsData.map((p: any) => p.seller_id))]

  // Fetch seller profiles
  const { data: profilesData } = await supabase
    .from('profiles')
    .select('id, name, full_name, avatar_url, rank, banned')
    .in('id', sellerIds)

  // Merge profiles into products
  const merged = productsData.map((product: any) => ({
    ...product,
    profiles: profilesData?.find((p: any) => p.id === product.seller_id) || null
  }))

  const visible = merged.filter((p: any) => !p.profiles?.banned)

  const rankOrder: Record<string, number> = {
    premium: 3, verified: 2, starter: 1, none: 0
  }

  const sorted = [...visible].sort((a: any, b: any) =>
    (rankOrder[b.profiles?.rank || 'none'] || 0) -
    (rankOrder[a.profiles?.rank || 'none'] || 0)
  )

  setProducts(sorted)
  setRecentProducts(sorted.slice(0, 5))
  setProductsLoading(false)
  
  console.log('First product profiles:', sorted[0]?.profiles)
}

  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.06)',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderTop: '1px solid rgba(255, 255, 255, 0.22)',
    boxShadow: `
      0 8px 32px rgba(0, 0, 0, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.15),
      inset 0 -1px 0 rgba(255, 255, 255, 0.2)
    `,
    borderRadius: '28px'
  }

  const sidebarGlassStyle = {
    background: 'rgba(255, 255, 255, 0.04)',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderTop: '1px solid rgba(255, 255, 255, 0.22)',
    boxShadow: `
      0 8px 32px rgba(0, 0, 0, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.15),
      inset 0 -1px 0 rgba(255, 255, 255, 0.2)
    `,
    borderRadius: '20px'
  }

  return (
    <div key={lang} className="relative z-10">
      <Navbar />

      {/* PREMIUM SELLERS SPOTLIGHT */}
      {premiumSellers.length > 0 && (
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <span style={{ fontSize: '20px' }}>⭐</span>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>{t('home.premium_sellers')}</p>
              <h2 style={{ color: 'white', fontSize: '24px', fontWeight: '900', margin: 0 }}>{t('home.premium_spotlight')}</h2>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {premiumSellers.map(seller => (
              <Link href={`/seller/${seller.id}`} key={seller.id}>
                <div style={{
                  background: 'rgba(232,201,126,0.08)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '2px solid rgba(232,201,126,0.3)',
                  borderTop: '2px solid rgba(232,201,126,0.5)',
                  borderRadius: '20px',
                  padding: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 0 30px rgba(232,201,126,0.1)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 0 50px rgba(232,201,126,0.2)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(232,201,126,0.1)'
                }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(232,201,126,0.2)', border: '2px solid rgba(232,201,126,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E8C97E', fontWeight: '900', fontSize: '20px', flexShrink: 0, overflow: 'hidden' }}>
                      {seller.avatar_url ? (
                        <img src={seller.avatar_url} alt={seller.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        (seller.name || seller.full_name || 'S').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <p style={{ color: '#E8C97E', fontWeight: '800', fontSize: '16px', margin: 0 }}>
                          {seller.name || seller.full_name}
                        </p>
                        <span style={{ background: 'rgba(232,201,126,0.2)', border: '1px solid rgba(232,201,126,0.4)', color: '#E8C97E', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '9999px' }}>⭐ Premium</span>
                      </div>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '2px 0 0 0' }}>
                      {seller.products?.length || 0} {t('home.products_listed')}
                    </p>
                  </div>
                  {seller.bio && (
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: '0 0 12px 0', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {seller.bio}
                    </p>
                  )}
                  <p style={{ color: '#E8C97E', fontSize: '13px', fontWeight: '600', margin: 0 }}>{t('home.view_shop')}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* TOP SELLERS SECTION */}
      {topSellers.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>{t('home.top_sellers')}</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
            {topSellers.map(seller => (
              <Link href={`/seller/${seller.id}`} key={seller.id}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  background: seller.rank === 'premium' ? 'rgba(232,201,126,0.08)' : 'rgba(0,78,100,0.08)',
                  border: `1px solid ${seller.rank === 'premium' ? 'rgba(232,201,126,0.25)' : 'rgba(0,78,100,0.25)'}`,
                  borderRadius: '9999px',
                  padding: '8px 16px 8px 8px',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.2s'
                }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: seller.rank === 'premium' ? 'rgba(232,201,126,0.2)' : 'rgba(0,78,100,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: seller.rank === 'premium' ? '#E8C97E' : '#4DB8CC', fontWeight: '700', fontSize: '13px', overflow: 'hidden', flexShrink: 0 }}>
                    {seller.avatar_url ? (
                      <img src={seller.avatar_url} alt={seller.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      (seller.name || seller.full_name || 'S').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p style={{ color: seller.rank === 'premium' ? '#E8C97E' : '#4DB8CC', fontWeight: '700', fontSize: '13px', margin: 0 }}>
                      {seller.rank === 'premium' ? '⭐' : '✓'} {seller.name || seller.full_name}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* NEW SELLERS SECTION */}
      {newSellers.length > 0 && (
        <div style={{ marginTop: '48px' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>{t('home.new_sellers')}</p>
          <h2 style={{ color: 'white', fontSize: isMobile ? '20px' : '24px', fontWeight: '900', marginBottom: isMobile ? '16px' : '20px' }}>{t('home.just_started')}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(220px, 1fr))', gap: isMobile ? '12px' : '16px' }}>
            {newSellers.map(seller => (
              <Link href={`/seller/${seller.id}`} key={seller.id}>
                <div style={{
                  background: 'rgba(59,130,246,0.06)',
                  border: '1px solid rgba(59,130,246,0.2)',
                  borderRadius: '16px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(59,130,246,0.2)', border: '2px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#93c5fd', fontWeight: '700', fontSize: '16px', marginBottom: '12px', overflow: 'hidden' }}>
                    {seller.avatar_url ? (
                      <img src={seller.avatar_url} alt={seller.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      (seller.name || seller.full_name || 'S').charAt(0).toUpperCase()
                    )}
                  </div>
                  <p style={{ color: '#93c5fd', fontWeight: '700', fontSize: '15px', margin: '0 0 4px 0' }}>
                    🥉 {seller.name || seller.full_name}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0 }}>
                    {seller.products?.length || 0} {t('home.products_listed')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Main Board Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          maxWidth: '1200px',
          margin: 'auto',
          marginTop: '100px',
          ...glassStyle
        }}
        className="p-4 md:p-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT - Product Feed (70%) */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h1 className="text-2xl md:text-4xl font-black text-white mb-2">{t('home.featured')}</h1>
              <p className="text-white/60 text-base md:text-lg">{t('home.badge')}</p>
            </div>

            {productsLoading ? (
  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(260px, 1fr))', gap: isMobile ? '12px' : '20px' }}>
    {[...Array(6)].map((_, i) => (
      <div key={i} style={{
        height: '320px',
        background: 'rgba(255,255,255,0.04)',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.06)',
        animation: 'pulse 1.5s infinite'
      }} />
    ))}
  </div>
) : products.length === 0 ? (
  <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.4)' }}>
    {t('home.no_products')}
  </div>
) : (
  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(260px, 1fr))', gap: isMobile ? '12px' : '20px' }}>
    {products.map((product: any) => (
      <ProductCard key={product.id} product={product} />
    ))}
  </div>
)}
          </div>

          {/* RIGHT - Sidebar (30%) - Hidden on mobile */}
          <div className="hidden lg:block space-y-6">
            
            {/* Trending Sellers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={sidebarGlassStyle}
              className="p-6"
            >
              <div className="flex items-center space-x-2 mb-6">
                <TrendingUp className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-white text-lg">Trending Sellers</h3>
              </div>
              <div className="space-y-4">
                {trendingSellers.slice(0, 3).map((seller) => (
                  <Link
                    key={seller.id}
                    href={`/seller/${seller.id}`}
                    className="flex items-center space-x-4 p-3 rounded-xl transition-all duration-200 hover:bg-white/[0.05]"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-white/[0.06]">
                      {seller.avatar_url && getImageUrl(seller.avatar_url) ? (
                        <img
                          src={getImageUrl(seller.avatar_url)!}
                          alt={seller.full_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-6 h-6 text-white/60" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {seller.full_name || 'Seller'}
                      </p>
                      <p className="text-white/35 text-sm">Verified Seller</p>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Categories */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              style={sidebarGlassStyle}
              className="p-6"
            >
              <div className="flex items-center space-x-2 mb-6">
                <Package className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-white text-lg">Categories</h3>
              </div>
              <div className="space-y-3">
                {categories.slice(0, 6).map((category) => (
                  <Link
                    key={category.name}
                    href={`/browse?category=${category.name}`}
                    className="flex items-center justify-between p-3 rounded-xl transition-all duration-200 hover:bg-white/[0.05]"
                  >
                    <span className="text-white/80 font-medium">{category.name}</span>
                    <span className="text-white/35 text-sm">{category.count}</span>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Recently Added */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              style={sidebarGlassStyle}
              className="p-6"
            >
              <div className="flex items-center space-x-2 mb-6">
                <Package className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-white text-lg">Recently Added</h3>
              </div>
              <div className="space-y-4">
                {recentProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="flex items-center space-x-4 p-3 rounded-xl transition-all duration-200 hover:bg-white/[0.05]"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white/[0.06]">
                      {product.image_url && getImageUrl(product.image_url) ? (
                        <img
                          src={getImageUrl(product.image_url)!}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-white/20 text-xs">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {product.name}
                      </p>
                      <p className="text-amber-300 font-bold text-lg">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </motion.div>

      {/* Trust Banner */}
      <div style={{
        width: '100%',
        background: '#000000',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden',
        padding: '14px 0',
        marginTop: '60px'
      }}>
        <div style={{
          display: 'flex',
          width: 'max-content',
          animation: 'marquee 45s linear infinite',
        }}>
          {[...Array(2)].map((_, dupIndex) => (
            <div key={dupIndex} style={{ display: 'flex', alignItems: 'center' }}>
              {[
                { icon: '🚀', text: 'NEW PRODUCTS ADDED DAILY' },
                { icon: '📱', text: 'EASY CONTACT VIA WHATSAPP & TELEGRAM' },
                { icon: '⭐', text: 'RANKED & TRUSTED SHOPS' },
                { icon: '🔍', text: 'BROWSE 100+ PRODUCTS' },
                { icon: '💬', text: 'CHAT DIRECTLY — NO MIDDLEMAN' },
                { icon: '🇰🇭', text: '100% LOCAL CAMBODIAN SELLERS' },
                { icon: '✓', text: 'VERIFIED SELLERS ONLY' },
                { icon: '🏪', text: 'REAL SHOPS, REAL PEOPLE' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '0 32px',
                    whiteSpace: 'nowrap',
                  }}>
                    <span style={{ fontSize: '14px' }}>{item.icon}</span>
                    <span style={{
                      color: '#ffffff',
                      fontSize: '12px',
                      fontWeight: '700',
                      letterSpacing: '0.08em',
                    }}>
                      {item.text}
                    </span>
                  </div>
                  <span style={{
                    color: 'rgba(255,255,255,0.25)',
                    fontSize: '16px',
                    flexShrink: 0
                  }}>•</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
