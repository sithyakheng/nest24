'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Star, TrendingUp, Users } from 'lucide-react'
import PageWrapper from '@/components/PageWrapper'
import ProductCard from '@/components/ProductCard'
import { supabase } from '@/lib/supabase'

interface Product {
  id: string
  name: string
  price: number
  original_price?: number
  discount?: number
  category: string
  stock: number
  image_url?: string
  seller_id: string
  created_at: string
}

interface Seller {
  id: string
  full_name?: string
  avatar_url?: string
  bio?: string
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [spotlightSellers, setSpotlightSellers] = useState<Seller[]>([])
  const [recentProducts, setRecentProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHomepageData()
  }, [])

  const fetchHomepageData = async () => {
    try {
      // Fetch featured products
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .gt('stock', 0)
        .order('created_at', { ascending: false })
        .limit(8)

      // Fetch spotlight sellers
      const { data: sellers } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'seller')
        .limit(3)

      // Fetch recent products
      const { data: recent } = await supabase
        .from('products')
        .select('*')
        .gt('stock', 0)
        .order('created_at', { ascending: false })
        .limit(10)

      // Fetch seller info for products
      const sellerIds = [...new Set(products?.map(p => p.seller_id) || [])]
      if (sellerIds.length > 0) {
        const { data: sellerData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', sellerIds)

        const productsWithSellers = products?.map(product => ({
          ...product,
          seller: sellerData?.find(s => s.id === product.seller_id)
        })) || []

        setFeaturedProducts(productsWithSellers)
      } else {
        setFeaturedProducts(products || [])
      }

      setSpotlightSellers(sellers || [])
      setRecentProducts(recent || [])
    } catch (error) {
      console.error('Error fetching homepage data:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { emoji: '📱', name: 'Electronics', count: 156 },
    { emoji: '👗', name: 'Fashion', count: 89 },
    { emoji: '🏠', name: 'Home', count: 234 },
    { emoji: '💄', name: 'Beauty', count: 67 },
    { emoji: '🍜', name: 'Food', count: 145 },
    { emoji: '🎮', name: 'Gaming', count: 78 }
  ]

  if (loading) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="pt-24 px-6 pb-12">
        
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl w-full"
          >
            <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/[0.12] rounded-3xl p-10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-block bg-amber-500/20 border border-amber-500/30 rounded-full px-4 py-2 mb-6"
              >
                <span className="text-amber-300 font-black text-sm tracking-wider">
                  🇰🇭 Cambodia's #1 Seller Marketplace
                </span>
              </motion.div>

              {/* Headline */}
              <div className="mb-8">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="font-black tracking-tight text-white mb-4"
                >
                  <span className="block text-5xl mb-2">Find It.</span>
                  <span className="block text-5xl mb-2">Buy It.</span>
                  <span className="block text-5xl text-amber-300">Trust It.</span>
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="font-light text-white/50 leading-relaxed text-lg"
                >
                  Shop directly from real Cambodian sellers
                </motion.p>
              </div>

              {/* Search Bar */}
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  const query = formData.get('search') as string
                  if (query?.trim()) {
                    window.location.href = `/browse?search=${encodeURIComponent(query)}`
                  }
                }}
                className="relative"
              >
                <div className="flex items-center bg-white/[0.06] border border-white/[0.12] rounded-full p-2">
                  <Search className="w-6 h-6 text-white/30 ml-4" />
                  <input
                    type="text"
                    name="search"
                    placeholder="Search products..."
                    className="flex-1 bg-transparent text-white placeholder:text-white/30 text-lg px-4 py-3 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-teal-500 hover:bg-teal-600 text-white rounded-full px-6 py-3 font-medium transition-colors mr-2"
                  >
                    Search
                  </button>
                </div>
              </motion.form>

              {/* Category Pills */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="flex flex-wrap gap-3 mt-6"
              >
                {categories.map((category, index) => (
                  <button
                    key={category.name}
                    onClick={() => window.location.href = `/browse?category=${category.name.toLowerCase()}`}
                    className="bg-white/[0.06] border border-white/[0.12] rounded-full px-4 py-2 text-white/60 hover:text-white hover:bg-white/[0.10] hover:border-white/[0.20] transition-all duration-200 flex items-center space-x-2"
                  >
                    <span className="text-xl">{category.emoji}</span>
                    <span className="text-sm font-medium">{category.name}</span>
                  </button>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Featured Products Section */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="uppercase tracking-widest text-xs text-white/40 font-medium">FEATURED LISTINGS</span>
                <h2 className="font-black tracking-tight text-white text-2xl">Top Picks For You</h2>
              </div>
              <button
                onClick={() => window.location.href = '/browse'}
                className="text-amber-300 hover:text-amber-200 font-medium transition-colors flex items-center space-x-1"
              >
                View All Products
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  →
                </motion.span>
              </button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Spotlight Seller Section */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="uppercase tracking-widest text-xs text-white/40 font-medium">SELLER SPOTLIGHT</span>
                <h2 className="font-black tracking-tight text-white text-2xl">Meet Our Top Sellers</h2>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {spotlightSellers.map((seller, index) => (
              <motion.div
                key={seller.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                onClick={() => window.location.href = `/seller/${seller.id}`}
                className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] rounded-2xl p-6 cursor-pointer hover:bg-white/[0.10] hover:translate-y-[-4px] transition-all duration-300"
              >
                <div className="flex items-center space-x-4 mb-4">
                  {seller.avatar_url ? (
                    <img
                      src={seller.avatar_url}
                      alt={seller.full_name || 'Seller'}
                      className="w-16 h-16 rounded-full object-cover border-2 border-amber-500/30"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-white/[0.12] rounded-full flex items-center justify-center border-2 border-amber-500/30">
                      <span className="text-white text-2xl font-bold">
                        {seller.full_name?.[0] || 'S'}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-white text-lg">
                      {seller.full_name || 'Seller'}
                    </h3>
                    <p className="text-teal-400 text-sm font-medium">Verified Seller</p>
                  </div>
                </div>
                
                {seller.bio && (
                  <p className="text-white/50 text-sm line-clamp-2 mb-4">
                    {seller.bio}
                  </p>
                )}
                
                <button className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-full px-4 py-2 font-medium transition-colors">
                  View Shop →
                </button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Browse By Category Section */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8"
          >
            <div className="mb-6">
              <span className="uppercase tracking-widest text-xs text-white/40 font-medium">CATEGORIES</span>
              <h2 className="font-black tracking-tight text-white text-2xl">What Are You Looking For?</h2>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <motion.button
                key={category.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                onClick={() => window.location.href = `/browse?category=${category.name.toLowerCase()}`}
                className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] rounded-2xl p-8 text-left hover:bg-white/[0.10] hover:translate-y-[-4px] transition-all duration-300 group"
                style={{
                  boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${getCategoryGlow(category.name)}`
                }}
              >
                <div className="text-5xl mb-4">{category.emoji}</div>
                <h3 className="font-bold text-white text-xl mb-2">{category.name}</h3>
                <p className="text-white/50 text-sm">{category.count} items</p>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Recent Listings Section */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="uppercase tracking-widest text-xs text-white/40 font-medium">JUST LISTED</span>
                <h2 className="font-black tracking-tight text-white text-2xl">Fresh From Sellers</h2>
              </div>
            </div>
          </motion.div>

          <div className="relative">
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
              {recentProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.05, duration: 0.5 }}
                  className="flex-shrink-0 w-64"
                >
                  <ProductCard product={product} size="small" />
                </motion.div>
              ))}
            </div>
            
            {/* Fade-out gradient */}
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#0d0e12] to-transparent pointer-events-none"></div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] rounded-2xl p-8 mt-16">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-black text-white text-xl">NestKH</span>
                <div className="w-2 h-2 bg-teal-500 rounded-full shadow-[0_0_10px_rgba(0,78,100,0.4)]"></div>
              </div>
              <p className="text-white/50 text-sm">Cambodia's Premier Seller Marketplace</p>
            </div>
            
            <div className="flex flex-wrap items-center space-x-6 text-sm">
              <button className="text-white/60 hover:text-white transition-colors">Browse</button>
              <button className="text-white/60 hover:text-white transition-colors">Become a Seller</button>
              <button className="text-white/60 hover:text-white transition-colors">About</button>
              <button className="text-white/60 hover:text-white transition-colors">Contact</button>
            </div>
          </div>
          
          <div className="text-center mt-6 pt-6 border-t border-white/[0.12]">
            <p className="text-white/30 text-sm">
              © 2024 NestKH — Made in Cambodia 🇰🇭
            </p>
          </div>
        </footer>
      </div>
    </PageWrapper>
  )
}

function getCategoryGlow(category: string): string {
  const glows: { [key: string]: string } = {
    'Electronics': 'rgba(59, 130, 246, 0.3)',
    'Fashion': 'rgba(236, 72, 153, 0.3)',
    'Home': 'rgba(34, 197, 94, 0.3)',
    'Beauty': 'rgba(251, 146, 60, 0.3)',
    'Food': 'rgba(220, 38, 38, 0.3)',
    'Gaming': 'rgba(168, 85, 247, 0.3)'
  }
  return glows[category] || 'rgba(0, 78, 100, 0.3)'
}
