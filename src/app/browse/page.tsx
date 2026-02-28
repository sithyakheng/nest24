'use client'

import { Suspense } from 'react'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Home', 'Beauty', 'Food', 'Gaming', 'Other']

function BrowseContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState(searchParams.get('category') || 'All')
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [sort, setSort] = useState('newest')

  useEffect(() => {
    fetchProducts()
  }, [category, sort])

  async function fetchProducts() {
    setLoading(true)
    let query = supabase.from('products').select('*, profiles(name, avatar_url)')

    if (category !== 'All') {
      query = query.eq('category', category)
    }

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    if (sort === 'newest') {
      query = query.order('created_at', { ascending: false })
    } else if (sort === 'price_asc') {
      query = query.order('price', { ascending: true })
    } else if (sort === 'price_desc') {
      query = query.order('price', { ascending: false })
    }

    const { data } = await query
    setProducts(data || [])
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0d0e12] pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">

        <div className="mb-8">
          <p className="uppercase tracking-widest text-xs text-white/40 mb-2">MARKETPLACE</p>
          <h1 className="text-4xl font-black text-white">Browse Products</h1>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
            placeholder="Search products..."
            className="flex-1 min-w-64 bg-white/[0.06] border border-white/[0.12] 
            text-white placeholder:text-white/30 rounded-xl px-4 py-3 
            focus:outline-none focus:ring-2 focus:ring-teal-500/50"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-white/[0.06] border border-white/[0.12] text-white 
            rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all
                ${category === cat
                  ? 'bg-teal-500/20 border-teal-500/50 text-teal-300'
                  : 'bg-white/[0.06] border-white/[0.12] text-white/60 hover:text-white'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 bg-white/[0.04] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="bg-white/[0.06] border border-white/[0.12] rounded-2xl p-12">
              <p className="text-white/40 text-lg mb-4">No products found</p>
              <button
                onClick={() => { setCategory('All'); setSearch('') }}
                className="px-6 py-2 rounded-full bg-teal-500/20 border 
                border-teal-500/30 text-teal-300 text-sm"
              >
                Clear Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default function BrowsePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0d0e12] flex items-center 
      justify-center text-white/50 text-lg">
        Loading...
      </div>
    }>
      <BrowseContent />
    </Suspense>
  )
}
