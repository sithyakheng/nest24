'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Search, Star, TrendingUp, Package, ArrowRight } from 'lucide-react'
import PageWrapper from '@/components/PageWrapper'
import ProductCard from '@/components/ProductCard'
import { supabase } from '@/lib/supabase'

const CATEGORIES = [
  { name: 'Electronics', emoji: '💻', glow: 'from-cyan-500/20' },
  { name: 'Fashion', emoji: '👗', glow: 'from-pink-500/20' },
  { name: 'Home', emoji: '🏠', glow: 'from-amber-500/20' },
  { name: 'Beauty', emoji: '💄', glow: 'from-purple-500/20' },
  { name: 'Food', emoji: '🍜', glow: 'from-green-500/20' },
  { name: 'Gaming', emoji: '🎮', glow: 'from-red-500/20' }
]

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([])
  const [sellers, setSellers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHomepageData()
  }, [])

  const fetchHomepageData = async () => {
    try {
      // Fetch featured products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .gt('stock', 0)
        .order('created_at', { ascending: false })
        .limit(8)

      // Fetch spotlight sellers
      const { data: sellersData } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'seller')
        .limit(3)

      // Fetch seller info for products
      const sellerIds = [...new Set(productsData?.map(p => p.seller_id) || [])]
      if (sellerIds.length > 0) {
        const { data: sellerData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', sellerIds)

        const productsWithSellers = productsData?.map(product => ({
          ...product,
          seller: sellerData?.find(s => s.id === product.seller_id)
        })) || []

        setProducts(productsWithSellers)
      } else {
        setProducts(productsData || [])
      }

      setSellers(sellersData || [])
    } catch (error) {
      console.error('Error fetching homepage data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageWrapper>
      <div className="pt-24 px-6 pb-12">
        
        {/* Hero Section - Cinematic */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="min-h-[80vh] flex items-center justify-center mb-20"
        >
          <div className="max-w-4xl mx-auto text-center">
            
            {/* Floating Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 2, -2, 0]
                }}
                transition={{ duration: 8, repeat: Infinity }}
                className="absolute top-20 left-20 w-32 h-32 bg-teal-500/[0.1] rounded-full blur-2xl"
              />
              <motion.div
                animate={{ 
                  scale: [1, 0.9, 1],
                  rotate: [0, -3, 3, 0]
                }}
                transition={{ duration: 10, repeat: Infinity }}
                className="absolute bottom-20 right-20 w-40 h-40 bg-amber-500/[0.08] rounded-full blur-2xl"
              />
            </div>

            {/* Main Hero Glass Panel */}
            <motion.div
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative bg-white/[0.05] backdrop-blur-3xl border border-white/[0.08] border-t-white/[0.18] rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.8)] p-12 max-w-3xl mx-auto"
            >
              
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="inline-block bg-amber-500/20 backdrop-blur-xl border border-amber-400/30 rounded-full px-6 py-2 mb-8"
              >
                <span className="text-amber-300 font-medium text-sm">🇰🇭 Cambodia's Premium Seller Marketplace</span>
              </motion.div>

              {/* Animated Headline */}
              <div className="mb-8 space-y-2">
                <motion.h1
                  initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="font-black text-white text-6xl tracking-tight leading-tight"
                >
                  Find It.
                </motion.h1>
                <motion.h1
                  initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="font-black text-white text-6xl tracking-tight leading-tight"
                >
                  Buy It.
                </motion.h1>
                <motion.h1
                  initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                  className="font-black text-white text-6xl tracking-tight leading-tight"
                >
                  Trust It.
                </motion.h1>
              </div>

              {/* Floating Search Console */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="relative max-w-2xl mx-auto"
              >
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for premium Cambodian products..."
                    className="w-full bg-white/[0.08] backdrop-blur-xl border border-white/[0.12] rounded-2xl px-6 py-4 pr-14 text-white placeholder:text-white/40 text-lg focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500/40 shadow-inner"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl p-3 shadow-[0_4px_20px_rgba(0,78,100,0.4)]"
                  >
                    <Search className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Category Orbs */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <p className="uppercase tracking-widest text-xs text-white/40 font-medium mb-4">EXPLORE CATEGORIES</p>
            <h2 className="font-black text-white text-3xl">Shop by Category</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-6xl mx-auto">
            {CATEGORIES.map((category, index) => (
              <motion.button
                key={category.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                whileHover={{ 
                  y: -8,
                  scale: 1.1,
                  rotate: [0, 5, -5, 0],
                  transition: { rotate: { duration: 0.5 } }
                }}
                className={`relative group bg-white/[0.05] backdrop-blur-3xl border border-white/[0.08] border-t-white/[0.18] rounded-full w-24 h-24 mx-auto flex flex-col items-center justify-center space-y-2 shadow-[0_20px_60px_rgba(0,0,0,0.6)] hover:shadow-[0_30px_80px_rgba(0,78,100,0.3)] transition-all`}
              >
                <div className={`absolute inset-0 bg-gradient-radial ${category.glow} rounded-full opacity-0 group-hover:opacity-100 transition-opacity`} />
                <span className="text-3xl mb-1">{category.emoji}</span>
                <span className="text-xs text-white/80 font-medium">{category.name}</span>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Featured Products */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <p className="uppercase tracking-widest text-xs text-white/40 font-medium mb-4">CURATED FOR CAMBODIA</p>
            <h2 className="font-black text-white text-3xl">Featured Products</h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-80 bg-white/[0.04] rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.6 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Seller Spotlight */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <p className="uppercase tracking-widest text-xs text-white/40 font-medium mb-4">BOUTIQUE SELLERS</p>
            <h2 className="font-black text-white text-3xl">Spotlight Sellers</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {sellers.map((seller, index) => (
              <motion.div
                key={seller.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index, duration: 0.6 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-white/[0.05] backdrop-blur-3xl border border-white/[0.08] border-t-white/[0.18] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] p-8"
              >
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-radial from-amber-500/[0.05] via-transparent to-transparent rounded-2xl" />
                
                <div className="relative">
                  <div className="flex items-start space-x-4 mb-6">
                    {/* Large Avatar */}
                    <div className="relative">
                      {seller.avatar_url ? (
                        <img
                          src={seller.avatar_url}
                          alt={seller.full_name || 'Seller'}
                          className="w-16 h-16 rounded-full object-cover border-2 border-amber-500/30"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-white/[0.12] rounded-full flex items-center justify-center border-2 border-amber-500/30">
                          <span className="text-white text-xl font-bold">
                            {seller.full_name?.[0] || 'S'}
                          </span>
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-teal-400 rounded-full animate-pulse" />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-black text-white text-xl mb-1">
                        {seller.full_name || 'Seller'}
                      </h3>
                      <p className="text-teal-400 text-sm font-medium">Verified Boutique Seller</p>
                    </div>
                  </div>

                  {seller.bio && (
                    <p className="text-white/50 text-sm mb-6 leading-relaxed">
                      {seller.bio}
                    </p>
                  )}

                  <Link
                    href={`/seller/${seller.id}`}
                    className="inline-flex items-center text-teal-400 hover:text-teal-300 font-medium transition-colors group"
                  >
                    Visit Shop
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

      </div>
    </PageWrapper>
  )
}
