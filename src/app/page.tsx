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
      
      <div className="flex flex-col lg:flex-row">
        {/* LEFT - Product Feed (70%) */}
        <div className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Latest Products</h1>
            <p className="text-white/50 text-sm">Discover premium Cambodian products</p>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-white/[0.04] rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.4 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT - Sidebar (30%) */}
        <div className="w-full lg:w-96 p-6 pt-0 lg:pt-6">
          
          {/* Trending Sellers */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 mb-4">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <h3 className="font-semibold text-white text-sm">Trending Sellers</h3>
            </div>
            <div className="space-y-3">
              {trendingSellers.slice(0, 3).map((seller) => (
                <Link
                  key={seller.id}
                  href={`/seller/${seller.id}`}
                  className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/[0.04] transition-colors"
                >
                  <div className="w-8 h-8 bg-white/[0.08] rounded-full flex items-center justify-center">
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
          </div>

          {/* Categories */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 mb-4">
            <div className="flex items-center space-x-2 mb-4">
              <Package className="w-4 h-4 text-teal-400" />
              <h3 className="font-semibold text-white text-sm">Categories</h3>
            </div>
            <div className="space-y-2">
              {categories.slice(0, 6).map((category) => (
                <Link
                  key={category.name}
                  href={`/browse?category=${category.name}`}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.04] transition-colors"
                >
                  <span className="text-white/80 text-sm">{category.name}</span>
                  <span className="text-white/40 text-xs">{category.count}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recently Added */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4">
            <div className="flex items-center space-x-2 mb-4">
              <Package className="w-4 h-4 text-amber-400" />
              <h3 className="font-semibold text-white text-sm">Recently Added</h3>
            </div>
            <div className="space-y-3">
              {recentProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/[0.04] transition-colors"
                >
                  <div className="w-12 h-12 bg-white/[0.08] rounded-lg flex items-center justify-center flex-shrink-0">
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
          </div>

        </div>
      </div>
    </PageWrapper>
  )
}
