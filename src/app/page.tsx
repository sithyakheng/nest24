'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { TrendingUp, Package, User } from 'lucide-react'
import Navbar from '@/components/Navbar'
import ProductCard from '@/components/ProductCard'
import { supabase } from '@/lib/supabase'

const getImageUrl = (image_url: string): string | null => {
  if (!image_url) return null
  if (image_url.startsWith('http')) return image_url
  return `https://oisdppgqifhbtlanglwr.supabase.co/storage/v1/object/public/Product/${image_url}` 
}

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([])
  const [trendingSellers, setTrendingSellers] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [recentProducts, setRecentProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, profiles(id, name, full_name, avatar_url, rank, banned)')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Products fetch error:', error)
          return
        }

        const visible = (data || []).filter((p: any) => !p.profiles?.banned)
        
        const rankOrder: Record<string, number> = { 
          premium: 3, verified: 2, starter: 1, none: 0 
        }
        const sorted = [...visible].sort((a: any, b: any) =>
          (rankOrder[b.profiles?.rank || 'none'] || 0) - 
          (rankOrder[a.profiles?.rank || 'none'] || 0)
        )

        setProducts(sorted)
        // Fetch recent products for sidebar
        setRecentProducts(sorted.slice(0, 5))
      } catch (err) {
        console.error('Fetch error:', err)
      }
    }
    fetchProducts()
  }, [])

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
    <div className="relative z-10">
      <Navbar />
      
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
              <h1 className="text-2xl md:text-4xl font-black text-white mb-2">Latest Products</h1>
              <p className="text-white/60 text-base md:text-lg">Discover premium Cambodian products</p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-80 rounded-2xl animate-pulse bg-white/[0.02]" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.5 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
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
    </div>
  )
}
