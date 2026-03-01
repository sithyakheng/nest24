'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { MessageCircle, Phone, Mail, User, Package } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'

const getImageUrl = (image_url: string): string | null => {
  if (!image_url) return null
  if (image_url.startsWith('http')) return image_url
  return `https://oisdppgqifhbtlanglwr.supabase.co/storage/v1/object/public/Product/${image_url}` 
}

export default function ProductDetailPage() {
  const params = useParams()
  const productId = params.id as string
  const [product, setProduct] = useState<any>(null)
  const [seller, setSeller] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProduct()
  }, [productId])

  const fetchProduct = async () => {
    try {
      // Fetch product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()

      if (productError) throw productError

      // Fetch seller info
      if (productData) {
        const { data: sellerData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', productData.seller_id)
          .single()

        setSeller(sellerData)
        setProduct(productData)
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStockStatus = () => {
    if (!product) return { text: 'Loading', color: 'text-gray-400' }
    if (product.stock === 0) return { text: 'Out of Stock', color: 'text-red-400' }
    if (product.stock < 5) return { text: 'Low Stock', color: 'text-amber-400' }
    return { text: 'In Stock', color: 'text-teal-400' }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080a0f]">
        <Navbar />
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-96 bg-white/[0.04] rounded-2xl" />
            <div className="h-8 bg-white/[0.04] rounded-xl w-3/4" />
            <div className="h-6 bg-white/[0.04] rounded-xl w-1/2" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#080a0f]">
        <Navbar />
        <div className="p-6 text-center">
          <p className="text-white/50">Product not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#080a0f]">
      <Navbar />
      
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* LEFT - Product Image */}
          <div>
            <div className="relative aspect-video rounded-2xl border border-white/[0.08] overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.06)' }}>
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
          </div>

          {/* RIGHT - Product Info */}
          <div className="space-y-6">
            {/* Category Pill */}
            <div className="inline-block bg-teal-500/20 border border-teal-500/30 rounded-full px-3 py-1">
              <span className="text-teal-300 text-sm font-medium uppercase tracking-wider">
                {product.category}
              </span>
            </div>

            {/* Product Name */}
            <h1 className="text-3xl font-black text-white leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-center space-x-3">
              <span className="text-4xl font-black text-amber-300">
                ${product.price.toFixed(2)}
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-white/30 line-through text-lg">
                  ${product.original_price.toFixed(2)}
                </span>
              )}
              <span className={`text-sm font-medium ${getStockStatus().color}`}>
                {getStockStatus().text}
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <div className="text-white/60 leading-relaxed">
                <h3 className="font-semibold text-white mb-2">Description</h3>
                <p>{product.description}</p>
              </div>
            )}

            {/* Seller Box */}
            {seller && (
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4">
                <h3 className="font-semibold text-white mb-4">Seller Information</h3>
                
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.06)' }}>
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
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">
                      {seller.full_name || 'Seller'}
                    </h4>
                    <p className="text-white/40 text-sm">Verified Seller</p>
                    
                    {seller.bio && (
                      <p className="text-white/50 text-sm mt-2 leading-relaxed">
                        {seller.bio}
                      </p>
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="flex-1">
                  <h4 className="font-semibold text-white">
                    {seller.full_name || 'Seller'}
                  </h4>
                  <p className="text-white/40 text-sm">Verified Seller</p>
                  
                  {seller.bio && (
                    <p className="text-white/50 text-sm mt-2 leading-relaxed">
                      {seller.bio}
                    </p>
                        fontSize: '15px', 
                        marginTop: '2px' 
                      }}>
                        {seller.phone}
                      </p>
                    </div>
                  )}

                  {/* WhatsApp */}
                  {seller.whatsapp && (
                    <div style={{ marginBottom: '12px' }}>
                      <span style={{ 
                        color: 'rgba(255,255,255,0.4)', 
                        fontSize: '12px',
                        textTransform: 'uppercase', 
                        letterSpacing: '0.1em' 
                      }}>WhatsApp</span>
                      <a 
                        href={`https://wa.me/${seller.whatsapp.replace(/\D/g,'')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ 
                          color: '#4DB8CC', 
                          fontSize: '15px',
                          display: 'block', 
                          marginTop: '2px' 
                        }}
                      >
                        {seller.whatsapp}
                      </a>
                    </div>
                  )}

                  {/* Telegram */}
                  {seller.telegram && (
                    <div style={{ marginBottom: '12px' }}>
                      <span style={{ 
                        color: 'rgba(255,255,255,0.4)', 
                        fontSize: '12px',
                        textTransform: 'uppercase', 
                        letterSpacing: '0.1em' 
                      }}>Telegram</span>
                      <a 
                        href={`https://t.me/${seller.telegram.replace('@','')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ 
                          color: '#4DB8CC', 
                          fontSize: '15px',
                          display: 'block', 
                          marginTop: '2px' 
                        }}
                      >
                        {seller.telegram}
                      </a>
                    </div>
                  )}

                  {/* Facebook */}
                  {seller.facebook && (
                    <div style={{ marginBottom: '12px' }}>
                      <span style={{ 
                        color: 'rgba(255,255,255,0.4)', 
                        fontSize: '12px',
                        textTransform: 'uppercase', 
                        letterSpacing: '0.1em' 
                      }}>Facebook</span>
                      <a 
                        href={seller.facebook.startsWith('http') 
                          ? seller.facebook 
                          : `https://facebook.com/${seller.facebook}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ 
                          color: '#4DB8CC', 
                          fontSize: '15px',
                          display: 'block', 
                          marginTop: '2px' 
                        }}
                      >
                        {seller.facebook}
                      </a>
                    </div>
                  )}

                  {/* Instagram */}
                  {seller.instagram && (
                    <div style={{ marginBottom: '12px' }}>
                      <span style={{ 
                        color: 'rgba(255,255,255,0.4)', 
                        fontSize: '12px',
                        textTransform: 'uppercase', 
                        letterSpacing: '0.1em' 
                      }}>Instagram</span>
                      <a 
                        href={`https://instagram.com/${seller.instagram.replace('@','')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ 
                          color: '#4DB8CC', 
                          fontSize: '15px',
                          display: 'block', 
                          marginTop: '2px' 
                        }}
                      >
                        {seller.instagram}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Main CTA */}
            <button className="w-full bg-amber-400 hover:bg-amber-500 text-black rounded-full py-3 font-semibold transition-colors duration-200">
              Contact Seller
            </button>

            {/* Back Link */}
            <Link
              href="/browse"
              className="inline-flex items-center text-white/60 hover:text-white text-sm transition-colors"
            >
              ← Back to Browse
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
