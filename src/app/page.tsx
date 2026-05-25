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
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/Product/${image_url}` 
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
  }, [])

async function fetchProducts() {
  setProductsLoading(true)
  
  const { data: productsData, error: productsError } = await supabase
    .from('products')
    .select('*, profiles!seller_id(id, name, full_name, avatar_url, rank, tier)')
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

}

  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.06)',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    borderRadius: '28px'
  }

  const sidebarGlassStyle = {
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  }

  return (
    <div key={lang} className="relative z-10 homepage-background">
      <Navbar />
      <div className="min-h-full sm:min-h-screen bg-white" style={{ paddingTop: isMobile ? '80px' : '120px' }}>

      {/* Main Board Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          maxWidth: '1200px',
          margin: 'auto',
          marginTop: '0px',
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

      </div>
    </div>
  )
}
