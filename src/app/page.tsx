'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { TrendingUp, Package, User } from 'lucide-react'
import PageWrapper from '@/components/PageWrapper'
import Navbar from '@/components/Navbar'
import ProductCard from '@/components/ProductCard'
import { supabase } from '@/lib/supabase'

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([])
  const [trendingSellers, setTrendingSellers] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [recentProducts, setRecentProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHomepageData()
  }, [])

  const fetchHomepageData = async () => {
    try {
      // Fetch main product feed
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .gt('stock', 0)
        .order('created_at', { ascending: false })
        .limit(10)

      // Fetch seller info for products
      const sellerIds = [...new Set(productsData?.map(p => p.seller_id) || [])]
      let sellerData: any[] = []
      
      if (sellerIds.length > 0) {
        const { data } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', sellerIds)
        sellerData = data || []
      }

      const productsWithSellers = productsData?.map(product => ({
        ...product,
        seller: sellerData.find(s => s.id === product.seller_id)
      })) || []

      setProducts(productsWithSellers)

      // Fetch trending sellers
      const { data: sellersData } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'seller')
        .limit(5)
      setTrendingSellers(sellersData || [])

      // Fetch categories with product counts
      const { data: categoryData } = await supabase
        .from('products')
        .select('category')
        .gt('stock', 0)
      
      const categoryCounts = categoryData?.reduce((acc: any, product: any) => {
        acc[product.category] = (acc[product.category] || 0) + 1
        return acc
      }, {}) || {}

      setCategories(Object.entries(categoryCounts).map(([name, count]) => ({ name, count })))

      // Fetch recent products for sidebar
      setRecentProducts(productsWithSellers.slice(0, 5))

    } catch (error) {
      console.error('Error fetching homepage data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageWrapper>
      <Navbar />
      
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* LEFT - Product Feed (70%) */}
          <div className="lg:col-span-2">
            {/* LIQUID GLASS FEED CONTAINER */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="rounded-3xl p-6 shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                backdropFilter: 'blur(24px) saturate(180%) brightness(110%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%) brightness(110%)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderTop: '1px solid rgb(255, 255, 255, 0.2)',
                borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
                borderRight: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white mb-2">Latest Products</h1>
                <p className="text-white/50 text-sm">Discover premium Cambodian products</p>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-32 rounded-2xl animate-pulse"
                      style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index, duration: 0.4 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* RIGHT - Sidebar (30%) */}
          <div className="space-y-6">
            
            {/* Trending Sellers */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="rounded-3xl p-5 shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                backdropFilter: 'blur(24px) saturate(180%) brightness(110%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%) brightness(110%)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderTop: '1px solid rgb(255, 255, 255, 0.2)',
                borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
                borderRight: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <h3 className="font-semibold text-white text-sm">Trending Sellers</h3>
              </div>
              <div className="space-y-3">
                {trendingSellers.slice(0, 3).map((seller) => (
                  <Link
                    key={seller.id}
                    href={`/seller/${seller.id}`}
                    className="flex items-center space-x-3 p-2 rounded-xl transition-all duration-200"
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'
                    }}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      {seller.avatar_url ? (
                        <img
                          src={seller.avatar_url}
                          alt={seller.full_name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4 text-white/60" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {seller.full_name || 'Seller'}
                      </p>
                      <p className="text-white/40 text-xs">Verified Seller</p>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Categories */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="rounded-3xl p-5 shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                backdropFilter: 'blur(24px) saturate(180%) brightness(110%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%) brightness(110%)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderTop: '1px solid rgb(255, 255, 255, 0.2)',
                borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
                borderRight: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <div className="flex items-center space-x-2 mb-4">
                <Package className="w-4 h-4 text-teal-400" />
                <h3 className="font-semibold text-white text-sm">Categories</h3>
              </div>
              <div className="space-y-2">
                {categories.slice(0, 6).map((category) => (
                  <Link
                    key={category.name}
                    href={`/browse?category=${category.name}`}
                    className="flex items-center justify-between p-2 rounded-xl transition-all duration-200"
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'
                    }}
                  >
                    <span className="text-white/80 text-sm">{category.name}</span>
                    <span className="text-white/40 text-xs">{category.count}</span>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Recently Added */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="rounded-3xl p-5 shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                backdropFilter: 'blur(24px) saturate(180%) brightness(110%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%) brightness(110%)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderTop: '1px solid rgb(255, 255, 255, 0.2)',
                borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
                borderRight: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <div className="flex items-center space-x-2 mb-4">
                <Package className="w-4 h-4 text-amber-400" />
                <h3 className="font-semibold text-white text-sm">Recently Added</h3>
              </div>
              <div className="space-y-3">
                {recentProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="flex items-center space-x-3 p-2 rounded-xl transition-all duration-200"
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'
                    }}
                  >
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full rounded-lg object-cover"
                        />
                      ) : (
                        <Package className="w-5 h-5 text-white/40" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {product.name}
                      </p>
                      <p className="text-amber-300 text-sm font-semibold">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </PageWrapper>
  )
}
