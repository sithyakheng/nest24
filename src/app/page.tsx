'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TrendingUp, Package, User, Star, Rocket, Smartphone, MessageSquare, Search, Store, Check, Headphones, MessageCircle, Zap, ShieldCheck, Bell, Home, Heart } from 'lucide-react'
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
  const pathname = usePathname()
  const [products, setProducts] = useState<any[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [trendingSellers, setTrendingSellers] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [recentProducts, setRecentProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [windowWidth, setWindowWidth] = useState(1200)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const isMobile = windowWidth < 768
  const isSmallMobile = windowWidth < 480

  const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Home', 'Beauty', 'Gaming', 'Other']
  
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
      {/* Desktop Navbar */}
      <div className="hidden md:block">
        <Navbar />
      </div>

      {/* Mobile Header */}
      <div className="block md:hidden bg-[#0d9488] px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-white font-semibold text-xl">NestKH</h1>
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-white" />
            <User className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full bg-white/20 backdrop-blur text-white placeholder-white/60 text-sm outline-none"
          />
        </div>
      </div>

      <div className="min-h-full sm:min-h-screen bg-white dot-grid-background pb-14 md:pb-0">
      {/* Mobile Category Pills */}
      <div className="block md:hidden px-3 py-3 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 text-sm rounded-full border whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#0d9488] text-white border-[#0d9488]'
                  : 'border-teal-200 text-[#0d9488]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Promo Banner */}
      <div className="block md:hidden mx-3 my-2">
        <div className="bg-[#004E64] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-white/60 text-xs mb-1">Limited time offer</p>
            <p className="text-white font-bold">Shop & save big</p>
          </div>
          <Link href="/browse">
            <button className="bg-[#0d9488] text-white px-4 py-2 rounded-xl text-sm font-medium">
              Browse
            </button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* LEFT - Products */}
          <div className="w-full lg:flex-1 min-w-0">
            <div className="hidden md:block mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">{t('home.featured')}</h1>
              <p className="text-gray-500 text-base">{t('home.badge')}</p>
            </div>
            <div className="block md:hidden mb-3 px-1">
              <h2 className="text-base font-semibold text-gray-800">Featured products</h2>
            </div>

            {productsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 text-gray-400">{t('home.no_products')}</div>
            ) : (
              <>
                {/* Mobile Grid */}
                <div className="grid grid-cols-2 gap-3 md:hidden">
                  {products
                    .filter((p: any) => selectedCategory === 'All' || p.category === selectedCategory)
                    .filter((p: any) => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((product: any) => (
                    <Link href={`/products/${product.id}`} key={product.id}>
                      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                        <div className="aspect-square bg-teal-50">
                          {product.image_url && getImageUrl(product.image_url) ? (
                            <img src={getImageUrl(product.image_url)!} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Image</div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <p className="text-sm font-semibold text-[#0d9488]">${product.price}</p>
                            {product.compare_price && <p className="text-xs text-gray-400 line-through">${product.compare_price}</p>}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Desktop Grid */}
                <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {products.map((product: any) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* RIGHT - Sidebar (desktop only) */}
          <div className="hidden lg:block w-72 flex-shrink-0 space-y-4">
            <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '16px' }} className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-teal-500" />
                <h3 className="font-bold text-gray-900">Categories</h3>
              </div>
              <div className="space-y-2">
                {['Electronics','Fashion','Home Living','Beauty','Gaming','Other'].map((cat) => (
                  <Link key={cat} href={`/browse?category=${cat}`} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50">
                    <span className="text-gray-700 text-sm">{cat}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '16px' }} className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-gray-900">Recently Added</h3>
              </div>
              <div className="space-y-3">
                {recentProducts.map((product) => (
                  <Link key={product.id} href={`/products/${product.id}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      {product.image_url && getImageUrl(product.image_url) ? (
                        <img src={getImageUrl(product.image_url)!} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No img</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-amber-600 font-bold text-sm">${product.price.toFixed(2)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

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

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center h-14 z-50 md:hidden">
        <Link href="/" className="flex flex-col items-center gap-0.5 text-[10px]">
          <Home className={`w-5 h-5 ${pathname === '/' ? 'text-[#0d9488]' : 'text-gray-400'}`} />
          <span className={pathname === '/' ? 'text-[#0d9488]' : 'text-gray-400'}>Home</span>
        </Link>
        <Link href="/browse" className="flex flex-col items-center gap-0.5 text-[10px]">
          <Search className={`w-5 h-5 ${pathname === '/browse' ? 'text-[#0d9488]' : 'text-gray-400'}`} />
          <span className={pathname === '/browse' ? 'text-[#0d9488]' : 'text-gray-400'}>Browse</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center gap-0.5 text-[10px]">
          <Heart className={`w-5 h-5 ${pathname === '/profile' ? 'text-[#0d9488]' : 'text-gray-400'}`} />
          <span className={pathname === '/profile' ? 'text-[#0d9488]' : 'text-gray-400'}>Saved</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center gap-0.5 text-[10px]">
          <User className={`w-5 h-5 ${pathname === '/profile' ? 'text-[#0d9488]' : 'text-gray-400'}`} />
          <span className={pathname === '/profile' ? 'text-[#0d9488]' : 'text-gray-400'}>Profile</span>
        </Link>
      </div>

      </div>
    </div>
  )
}
