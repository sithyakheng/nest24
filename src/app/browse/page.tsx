'use client'

import { Suspense } from 'react'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'
import { useLang } from '@/contexts/LanguageContext'

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Home', 'Beauty', 'Food', 'Gaming', 'Other']

function BrowseContent() {
  const { t, lang } = useLang()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(true)
  const [category, setCategory] = useState(searchParams.get('category') || 'All')
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [sort, setSort] = useState('newest')
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
  }, [category, sort, search])

  async function fetchProducts() {
  setProductsLoading(true)

  const { data: productsData } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (!productsData) {
    setProductsLoading(false)
    return
  }

  const sellerIds = [...new Set(productsData.map((p: any) => p.seller_id))]

  const { data: profilesData } = await supabase
    .from('profiles')
    .select('id, name, full_name, avatar_url, rank, banned')
    .in('id', sellerIds)

  const merged = productsData.map((product: any) => ({
    ...product,
    profiles: profilesData?.find((p: any) => p.id === product.seller_id) || null
  }))

  const visible = merged.filter((p: any) => !p.profiles?.banned)

  const rankOrder: Record<string, number> = {
    premium: 3, verified: 2, starter: 1, none: 0
  }

  const sorted = [...visible].sort((a: any, b: any) =>
    (rankOrder[b.profiles?.rank || 'none'] || 0) -
    (rankOrder[a.profiles?.rank || 'none'] || 0)
  )

  setProducts(sorted)
  setProductsLoading(false)
}

  return (
    <div key={lang} className="min-h-screen bg-[#0d0e12]" style={{ paddingTop: isMobile ? '90px' : '120px', paddingBottom: isMobile ? '40px' : '60px', paddingLeft: isMobile ? '16px' : '24px', paddingRight: isMobile ? '16px' : '24px' }}>
      <div className="max-w-7xl mx-auto">

        <div className="mb-8">
          <p className="uppercase tracking-widest text-xs text-white/40 mb-2">MARKETPLACE</p>
          <h1 className="font-black text-white" style={{ fontSize: isMobile ? '24px' : '36px' }}>{t('browse.title')}</h1>
        </div>

        <div className="flex gap-4 mb-6" style={{ flexDirection: isMobile ? 'column' : 'row', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
            placeholder={t('home.search')}
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
            <option value="newest">{t('browse.sort_newest')}</option>
            <option value="price_asc">{t('browse.sort_low')}</option>
            <option value="price_desc">{t('browse.sort_high')}</option>
          </select>
        </div>

        <div className="flex gap-2 flex-wrap mb-8 overflow-x-auto whitespace-nowrap" style={{ scrollbarWidth: 'none', paddingBottom: '8px' }}>
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
              {cat === 'All' ? t('browse.all') : cat}
            </button>
          ))}
        </div>

        {/* Debug info */}
        <p style={{ color: 'white', fontSize: '12px', marginBottom: '20px' }}>
          Products loaded: {products.length}
        </p>

        {productsLoading ? (
  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(260px, 1fr))', gap: isMobile ? '10px' : '20px' }}>
    {[...Array(8)].map((_, i) => (
      <div key={i} style={{
        height: '320px',
        background: 'rgba(255,255,255,0.04)',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.06)',
        animation: 'pulse 1.5s ease-in-out infinite'
      }} />
    ))}
  </div>
) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="bg-white/[0.06] border border-white/[0.12] rounded-2xl p-12">
              <p className="text-white/40 text-lg mb-4">{t('browse.no_products')}</p>
              <button
                onClick={() => { setCategory('All'); setSearch('') }}
                className="px-6 py-2 rounded-full bg-teal-500/20 border 
                border-teal-500/30 text-teal-300 text-sm"
              >
                {t('browse.all')}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" style={{ gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : undefined }}>
            {products.map((product) => (
              <a href={`/products/${product.id}`} key={product.id}>
                <div style={{
                  background: 'rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderTop: '1px solid rgba(255,255,255,0.22)',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ height: '200px', overflow: 'hidden', 
                    background: 'rgba(255,255,255,0.04)', position: 'relative' }}>
                    {product.image_url ? (
                      <img
                        src={product.image_url 
                          ? (product.image_url.startsWith('http') 
                            ? product.image_url 
                            : `https://oisdppgqifhbtlanglwr.supabase.co/storage/v1/object/public/Product/${product.image_url}`)
                          : ''}
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', 
                        display: 'flex', alignItems: 'center', 
                        justifyContent: 'center', color: 'rgba(255,255,255,0.2)' }}>
                        No Image
                      </div>
                    )}
                    
                    {/* Rank Badges */}
                    {product.profiles?.rank === 'starter' && (
                      <span style={{
                        position: 'absolute', top: '8px', right: '8px',
                        background: 'rgba(59,130,246,0.3)',
                        border: '1px solid rgba(59,130,246,0.5)',
                        color: '#93c5fd', fontSize: '10px', fontWeight: '700',
                        padding: '3px 8px', borderRadius: '9999px',
                        backdropFilter: 'blur(8px)'
                      }}>🥉 Starter</span>
                    )}
                    {product.profiles?.rank === 'verified' && (
                      <span style={{
                        position: 'absolute', top: '8px', right: '8px',
                        background: 'rgba(0,78,100,0.4)',
                        border: '1px solid rgba(0,78,100,0.6)',
                        color: '#4DB8CC', fontSize: '10px', fontWeight: '700',
                        padding: '3px 8px', borderRadius: '9999px',
                        backdropFilter: 'blur(8px)'
                      }}>✓ Verified</span>
                    )}
                    {product.profiles?.rank === 'premium' && (
                      <span style={{
                        position: 'absolute', top: '8px', right: '8px',
                        background: 'rgba(232,201,126,0.3)',
                        border: '1px solid rgba(232,201,126,0.5)',
                        color: '#E8C97E', fontSize: '10px', fontWeight: '700',
                        padding: '3px 8px', borderRadius: '9999px',
                        backdropFilter: 'blur(8px)'
                      }}>⭐ Premium</span>
                    )}
                  </div>
                  <div style={{ padding: '16px' }}>
                    <span style={{ color: '#4DB8CC', fontSize: '11px', 
                      textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      {product.category}
                    </span>
                    <p style={{ color: 'white', fontWeight: '600', 
                      fontSize: '15px', marginTop: '4px' }}>
                      {product.name}
                    </p>
                    <p style={{ color: '#E8C97E', fontWeight: '900', 
                      fontSize: '18px', marginTop: '6px' }}>
                      ${product.price}
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', 
                      marginTop: '4px' }}>
                      by {product.profiles?.name || product.profiles?.full_name || 'Seller'}
                    </p>
                  </div>
                </div>
              </a>
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
