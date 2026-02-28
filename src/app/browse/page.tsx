'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Filter, X, ChevronDown } from 'lucide-react'
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
  seller?: {
    full_name?: string
    avatar_url?: string
  }
}

function BrowseContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest'
  })
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const categories = [
    'All', 'Electronics', 'Fashion', 'Home', 'Beauty', 'Food', 'Gaming'
  ]

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'price-low', label: 'Price: Low-High' },
    { value: 'price-high', label: 'Price: High-Low' },
    { value: 'popular', label: 'Most Popular' }
  ]

  useEffect(() => {
    // Initialize filters from URL params
    setFilters({
      category: searchParams.get('category') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      sortBy: searchParams.get('sort') || 'newest'
    })
  }, [searchParams])

  useEffect(() => {
    fetchProducts()
  }, [filters])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      let query = supabase.from('products').select('*')

      // Apply category filter
      if (filters.category && filters.category !== 'All') {
        query = query.eq('category', filters.category)
      }

      // Apply price filters
      if (filters.minPrice) {
        query = query.gte('price', parseFloat(filters.minPrice))
      }
      if (filters.maxPrice) {
        query = query.lte('price', parseFloat(filters.maxPrice))
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'price-low':
          query = query.order('price', { ascending: true })
          break
        case 'price-high':
          query = query.order('price', { ascending: false })
          break
        case 'popular':
          query = query.order('created_at', { ascending: false })
          break
        default:
          query = query.order('created_at', { ascending: false })
      }

      const { data } = await query

      // Fetch seller info for products
      const sellerIds = [...new Set(data?.map(p => p.seller_id) || [])]
      if (sellerIds.length > 0) {
        const { data: sellerData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', sellerIds)

        const productsWithSellers = data?.map(product => ({
          ...product,
          seller: sellerData?.find(s => s.id === product.seller_id)
        })) || []

        setProducts(productsWithSellers)
      } else {
        setProducts(data || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateFilter = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    // Update URL params
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v)
    })
    
    const newUrl = `/browse?${params.toString()}`
    window.history.pushState({}, '', newUrl)
  }

  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'newest'
    })
    window.history.pushState({}, '', '/browse')
  }

  const filteredProducts = useMemo(() => {
    let filtered = products
    
    // Apply search filter
    const searchQuery = searchParams.get('search')
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    return filtered
  }, [products, searchParams])

  return (
    <div className="pt-24 px-6 pb-12">
      <div className="flex flex-col lg:flex-row gap-6">
          
        {/* Filter Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${showMobileFilters ? 'fixed inset-0 z-40 bg-black/80' : 'hidden lg:block'} lg:sticky lg:top-24 w-full lg:w-80`}
        >
          <div className={`bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] rounded-2xl p-6 h-full overflow-y-auto ${
              showMobileFilters ? 'w-full max-w-sm' : ''
            }`}>
              
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-white text-lg">Filters</h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="lg:hidden text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block uppercase tracking-widest text-xs text-white/40 font-medium mb-3">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => updateFilter('category', category)}
                      className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                        filters.category === category
                          ? 'bg-teal-500 text-white'
                          : 'bg-white/[0.06] border border-white/[0.12] text-white/60 hover:text-white hover:bg-white/[0.10]'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block uppercase tracking-widest text-xs text-white/40 font-medium mb-3">
                  Price Range
                </label>
                <div className="space-y-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => updateFilter('minPrice', e.target.value)}
                    className="w-full bg-white/[0.06] border border-white/[0.12] text-white placeholder:text-white/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => updateFilter('maxPrice', e.target.value)}
                    className="w-full bg-white/[0.06] border border-white/[0.12] text-white placeholder:text-white/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                  />
                </div>
              </div>

              {/* Sort By */}
              <div className="mb-6">
                <label className="block uppercase tracking-widest text-xs text-white/40 font-medium mb-3">
                  Sort by
                </label>
                <div className="relative">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => updateFilter('sortBy', e.target.value)}
                    className="w-full bg-white/[0.06] border border-white/[0.12] text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500/50 appearance-none cursor-pointer"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="w-full bg-transparent border border-white/[0.12] text-white/60 hover:text-white hover:bg-white/[0.10] rounded-xl px-4 py-3 font-medium transition-all"
              >
                Clear Filters
              </button>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] rounded-2xl p-6 mb-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-black text-white text-2xl mb-2">Browse Products</h1>
                  <p className="text-white/60">
                    {filteredProducts.length} products found
                  </p>
                </div>
                
                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden bg-white/[0.06] border border-white/[0.12] rounded-full px-4 py-2 text-white/60 hover:text-white"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </motion.div>

            {/* Product Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-white/60">Loading products...</div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] rounded-2xl p-12 text-center"
              >
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="font-black text-white text-xl mb-2">No products found</h3>
                <p className="text-white/50 mb-6">Try adjusting your filters or search terms</p>
                <button
                  onClick={clearFilters}
                  className="bg-teal-500 hover:bg-teal-600 text-white rounded-full px-6 py-3 font-medium transition-colors"
                >
                  Clear filters
                </button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product, index) => (
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
            )}

            {/* Load More Button */}
            {!loading && filteredProducts.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center mt-8"
              >
                <button className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] rounded-full px-8 py-4 text-white/60 hover:text-white hover:bg-white/[0.10] transition-all font-medium">
                  Load More Products
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BrowsePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0d0e12] flex items-center 
      justify-center text-white/50">Loading...</div>
    }>
      <BrowseContent />
    </Suspense>
  )
}
