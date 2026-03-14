'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { TrendingUp, Package, User, Star, Rocket, Smartphone, MessageSquare, Search, Store, Check, Headphones, MessageCircle, Zap, ShieldCheck } from 'lucide-react'
import Navbar from '@/components/Navbar'
import ProductCard from '@/components/ProductCard'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'

const getImageUrl = (image_url: string): string | null => {
  if (!image_url) return null
  if (image_url.startsWith('http')) return image_url
  return `https://oisdppgqifhbtlanglwr.supabase.co/storage/v1/object/public/Product/${image_url}` 
}

const marqueeItems = [
  { text: 'NEW PRODUCTS ADDED DAILY' },
  { text: 'EASY CONTACT VIA WHATSAPP & TELEGRAM' },
  { text: 'RANKED & TRUSTED SHOPS' },
  { text: 'BROWSE 100+ PRODUCTS' },
  { text: 'CHAT DIRECTLY — NO MIDDLEMAN' },
  { text: '100% LOCAL CAMBODIAN SELLERS' },
  { text: 'VERIFIED SELLERS ONLY' },
  { text: 'REAL SHOPS, REAL PEOPLE' },
];

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
    .eq('tier', 'premium')
    .limit(3)
    .order('created_at', { ascending: false })
  setPremiumSellers(premiumSellersData || [])

  // Load top sellers (premium + verified)
  const { data: topSellersData } = await supabase
    .from('profiles')
    .select('*, products(id)')
    .eq('role', 'seller')
    .in('tier', [3, 2])
    .limit(6)
    .order('created_at', { ascending: false })
  setTopSellers(topSellersData || [])

  // Load new sellers (starter)
  const { data: newSellersData } = await supabase
    .from('profiles')
    .select('*, products(id)')
    .eq('role', 'seller')
    .eq('tier', 1)
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

  // Fetch seller profiles with tier expiry
  const { data: profilesData } = await supabase
    .from('profiles')
    .select('id, name, full_name, avatar_url, rank, banned, tier_expires_at')
    .in('id', sellerIds)

  // Merge profiles into products
  const merged = productsData.map((product: any) => ({
    ...product,
    profiles: profilesData?.find((p: any) => p.id === product.seller_id) || null
  }))

  const visible = merged.filter((p: any) => !p.profiles?.banned)

  // Helper function to determine seller status
  const getSellerStatus = (profile: any) => {
    if (!profile || profile.rank === 0) return 'free'
    if (profile.tier_expires_at && new Date(profile.tier_expires_at) > new Date()) return 'active'
    return 'expired'
  }

  // Sort by seller status, then tier, then likes
  const sorted = visible.sort((a: any, b: any) => {
    const aProfile = a.profiles
    const bProfile = b.profiles
    
    const aStatus = getSellerStatus(aProfile)
    const bStatus = getSellerStatus(bProfile)
    
    // Status priority: active > free > expired
    const statusOrder = { active: 0, free: 1, expired: 2 }
    const statusDiff = statusOrder[aStatus] - statusOrder[bStatus]
    if (statusDiff !== 0) return statusDiff
    
    // For active sellers, sort by tier (higher first)
    if (aStatus === 'active' && bStatus === 'active') {
      return (bProfile?.rank || 0) - (aProfile?.rank || 0)
    }
    
    // For same status, sort by likes
    return (b.likes || 0) - (a.likes || 0)
  })

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
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  }

  return (
    <div key={lang} className="relative z-10 bg-white">
      <Navbar />
      <div className="min-h-full sm:min-h-screen bg-white">

      {/* PREMIUM SELLERS SPOTLIGHT */}
      {premiumSellers.length > 0 && (
        <div style={{ marginBottom: isMobile ? '24px' : '48px', padding: isMobile ? '0 16px' : '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <Star size={20} />
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-0">{t('home.premium_sellers')}</p>
              <h2 className="text-gray-900 text-2xl font-black mb-0">{t('home.premium_spotlight')}</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        <span style={{ background: 'rgba(232,201,126,0.2)', border: '1px solid rgba(232,201,126,0.4)', color: '#E8C97E', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '9999px' }}><Star size={10} /> Premium</span>
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
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-0">{t('home.top_sellers')}</p>
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
                      {seller.rank === 'premium' ? <Star size={12} /> : <Check size={12} />} {seller.name || seller.full_name}
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
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">{t('home.new_sellers')}</p>
          <h2 className="text-gray-900 text-xl sm:text-2xl font-black mb-4 sm:mb-5">{t('home.just_started')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
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
          marginTop: isMobile ? '20px' : '100px',
          marginBottom: isMobile ? '20px' : '40px',
          ...glassStyle
        }}
        className="p-4 md:p-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT - Product Feed (70%) */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h1 className="text-2xl md:text-4xl font-black text-gray-900 mb-2">{t('home.featured')}</h1>
              <p className="text-gray-600 text-base md:text-lg">{t('home.badge')}</p>
            </div>

            {productsLoading ? (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
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
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
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
                <TrendingUp className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-gray-900 text-lg">Trending Sellers</h3>
              </div>
              <div className="space-y-4">
                {trendingSellers.slice(0, 3).map((seller) => (
                  <Link
                    key={seller.id}
                    href={`/seller/${seller.id}`}
                    className="flex items-center space-x-4 p-3 rounded-xl transition-all duration-200 hover:bg-gray-50"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
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
                          <User className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 font-medium truncate">
                        {seller.full_name || 'Seller'}
                      </p>
                      <p className="text-gray-500 text-sm">Verified Seller</p>
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
                <Package className="w-5 h-5 text-teal-500" />
                <h3 className="font-bold text-gray-900 text-lg">Categories</h3>
              </div>
              <div className="space-y-3">
                {categories.slice(0, 6).map((category) => (
                  <Link
                    key={category.name}
                    href={`/browse?category=${category.name}`}
                    className="flex items-center justify-between p-3 rounded-xl transition-all duration-200 hover:bg-gray-50"
                  >
                    <span className="text-gray-700 font-medium">{category.name}</span>
                    <span className="text-gray-500 text-sm">{category.count}</span>
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
                <Package className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-gray-900 text-lg">Recently Added</h3>
              </div>
              <div className="space-y-4">
                {recentProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="flex items-center space-x-4 p-3 rounded-xl transition-all duration-200 hover:bg-gray-50"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
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
                          <span className="text-gray-400 text-xs">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 font-medium truncate">
                        {product.name}
                      </p>
                      <p className="text-amber-600 font-bold text-lg">
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

      {/* Marquee Ticker */}
      <div style={{ backgroundColor: '#004E64', overflow: 'hidden', whiteSpace: 'nowrap', padding: '10px 0' }}>
        <div style={{ display: 'inline-block', animation: 'marquee 30s linear infinite' }}>
          {['NEW PRODUCTS ADDED DAILY', 'EASY CONTACT VIA WHATSAPP & TELEGRAM', 'RANKED & TRUSTED SHOPS', 'BROWSE 100+ PRODUCTS', 'CHAT DIRECTLY — NO MIDDLEMAN', '100% LOCAL CAMBODIAN SELLERS', 'VERIFIED SELLERS ONLY', 'REAL SHOPS, REAL PEOPLE'].map((text, i) => (
            <span key={i} style={{ color: 'white', fontWeight: 600, fontSize: '13px', marginRight: '48px', letterSpacing: '0.05em' }}>
              • {text}
            </span>
          ))}
        </div>
      </div>

      {/* Trust Feature Cards */}
      <section className="bg-gray-50 px-4 sm:px-6 py-10 sm:py-15">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <Headphones size={28} className="text-white" />, title: '24/7 Support', desc: "We're here to help you around the clock. Reach out anytime via our platform." },
            { icon: <Zap size={28} className="text-white" />, title: 'Instant Contact', desc: 'Connect directly with sellers via WhatsApp, Telegram, or Facebook instantly.' },
            { icon: <ShieldCheck size={28} className="text-white" />, title: 'Trusted Sellers', desc: 'Our tier verification system ensures you\'re buying from legitimate, trusted sellers.' },
          ].map((item, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">{item.icon}</div>
              <h3 className="text-slate-900 font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-slate-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 sm:px-6 py-6 sm:py-10 mt-10 sm:mt-15">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-8">
          <div className="text-gray-500 text-sm">
            © 2026 NestKH. All rights reserved.
          </div>
          
          <div className="flex gap-6">
            <Link href="/terms" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/privacy" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
