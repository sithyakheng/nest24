'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Phone, 
  MessageCircle, 
  Mail, 
  Send, 
  Facebook, 
  Instagram, 
  Share2, 
  User, 
  Package,
  ArrowLeft
} from 'lucide-react'
import PageWrapper from '@/components/PageWrapper'
import { supabase } from '@/lib/supabase'

interface Product {
  id: string
  name: string
  price: number
  original_price?: number
  discount?: number
  category: string
  stock: number
  description?: string
  image_url?: string
  seller_id: string
  created_at: string
}

interface Seller {
  id: string
  full_name?: string
  avatar_url?: string
  bio?: string
  phone?: string
  whatsapp?: string
  facebook?: string
  instagram?: string
  telegram?: string
  email?: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [seller, setSeller] = useState<Seller | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchProduct()
    }
  }, [params.id])

  const fetchProduct = async () => {
    try {
      // Fetch product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single()

      if (productError) throw productError

      setProduct(productData)

      // Fetch seller profile
      const { data: sellerData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', productData.seller_id)
        .single()

      setSeller(sellerData)
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      </PageWrapper>
    )
  }

  if (!product) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white">Product not found</div>
        </div>
      </PageWrapper>
    )
  }

  const discountPercentage = product.discount && product.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0

  const getStockStatus = () => {
    if (product.stock === 0) return { text: 'Out of Stock', color: 'text-red-400' }
    if (product.stock < 5) return { text: '⚠ Low Stock', color: 'text-amber-400' }
    return { text: '✓ In Stock', color: 'text-teal-400' }
  }

  return (
    <PageWrapper>
      <div className="pt-24 px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column - Image Panel */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] rounded-2xl overflow-hidden"
            >
              {/* Share Button */}
              <div className="absolute top-4 right-4 z-10">
                <button className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] rounded-full p-3 text-white/60 hover:text-white transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* Product Image */}
              <div className="relative h-[70vh]">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-white/[0.03] flex items-center justify-center">
                    <span className="text-white/30 text-6xl">📦</span>
                  </div>
                )}
              </div>

              {/* Thumbnail Strip - Future Ready */}
              <div className="p-4 border-t border-white/[0.12]">
                <div className="flex space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className="w-16 h-16 bg-white/[0.06] border border-white/[0.12] rounded-lg flex items-center justify-center"
                    >
                      <span className="text-white/30 text-xs">+{i}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right Column - Info Panel */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-6"
            >
              {/* Category Badge */}
              <div className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] rounded-2xl p-6">
                <div className="inline-block bg-teal-500/20 border border-teal-500/30 rounded-full px-3 py-1 text-sm">
                  <span className="text-teal-400 font-medium uppercase tracking-wider">
                    {product.category}
                  </span>
                </div>

                {/* Product Name */}
                <h1 className="font-black tracking-tight text-white text-3xl mb-4">
                  {product.name}
                </h1>

                {/* Price */}
                <div className="flex items-center space-x-3 mb-4">
                  <span className="font-black text-amber-300 text-4xl">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.original_price && product.original_price > product.price && (
                    <span className="text-white/30 line-through text-lg">
                      ${product.original_price.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Stock Status */}
                <div className="mb-6">
                  <div className={`inline-block bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] rounded-full px-4 py-2 text-sm font-medium ${getStockStatus().color}`}>
                    {getStockStatus().text}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white/[0.12] my-6"></div>

                {/* Description */}
                {product.description && (
                  <div className="mb-6">
                    <p className="font-light text-white/60 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* Divider */}
                <div className="border-t border-white/[0.12] my-6"></div>

                {/* Seller Card */}
                {seller && (
                  <div className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] rounded-2xl p-6">
                    <div className="uppercase tracking-widest text-xs text-white/40 font-medium mb-3">
                      Sold By
                    </div>
                    
                    <div className="flex items-center space-x-4 mb-4">
                      {seller.avatar_url ? (
                        <img
                          src={seller.avatar_url}
                          alt={seller.full_name || 'Seller'}
                          className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/30"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-white/[0.12] rounded-full flex items-center justify-center border-2 border-amber-500/30">
                          <User className="w-6 h-6 text-white/60" />
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
                      <p className="text-white/40 text-sm mb-4">
                        {seller.bio}
                      </p>
                    )}

                    {/* Contact Buttons */}
                    <div className="space-y-3">
                      <div className="uppercase tracking-widest text-xs text-white/40 font-medium mb-2">
                        Contact Seller
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {seller.phone && (
                          <a
                            href={`tel:${seller.phone}`}
                            className="bg-white/[0.06] border border-white/[0.12] rounded-full px-4 py-2 text-white/60 hover:text-white hover:bg-white/[0.10] transition-all flex items-center justify-center space-x-2 group"
                          >
                            <Phone className="w-4 h-4" />
                            <span className="text-sm">Call</span>
                          </a>
                        )}
                        
                        {seller.whatsapp && (
                          <a
                            href={`https://wa.me/${seller.whatsapp.replace(/[^\d]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white/[0.06] border border-white/[0.12] rounded-full px-4 py-2 text-white/60 hover:text-white hover:bg-white/[0.10] transition-all flex items-center justify-center space-x-2 group hover:bg-green-600/20"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-sm">WhatsApp</span>
                          </a>
                        )}
                        
                        {seller.email && (
                          <a
                            href={`mailto:${seller.email}`}
                            className="bg-white/[0.06] border border-white/[0.12] rounded-full px-4 py-2 text-white/60 hover:text-white hover:bg-white/[0.10] transition-all flex items-center justify-center space-x-2 group"
                          >
                            <Mail className="w-4 h-4" />
                            <span className="text-sm">Email</span>
                          </a>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {seller.facebook && (
                          <a
                            href={seller.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white/[0.06] border border-white/[0.12] rounded-full px-4 py-2 text-white/60 hover:text-white hover:bg-white/[0.10] transition-all flex items-center justify-center space-x-2 group hover:bg-indigo-600/20"
                          >
                            <Facebook className="w-4 h-4" />
                            <span className="text-sm">Facebook</span>
                          </a>
                        )}
                        
                        {seller.instagram && (
                          <a
                            href={seller.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white/[0.06] border border-white/[0.12] rounded-full px-4 py-2 text-white/60 hover:text-white hover:bg-white/[0.10] transition-all flex items-center justify-center space-x-2 group hover:bg-pink-600/20"
                          >
                            <Instagram className="w-4 h-4" />
                            <span className="text-sm">Instagram</span>
                          </a>
                        )}
                        
                        {seller.telegram && (
                          <a
                            href={`https://t.me/${seller.telegram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white/[0.06] border border-white/[0.12] rounded-full px-4 py-2 text-white/60 hover:text-white hover:bg-white/[0.10] transition-all flex items-center justify-center space-x-2 group hover:bg-blue-600/20"
                          >
                            <Send className="w-4 h-4" />
                            <span className="text-sm">Telegram</span>
                          </a>
                        )}
                      </div>
                    </div>

                    <Link
                      href={`/seller/${seller.id}`}
                      className="inline-flex items-center text-teal-400 hover:text-teal-300 font-medium transition-colors"
                    >
                      View Seller Shop
                      <ArrowLeft className="w-4 h-4 ml-1 rotate-180" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Main CTA */}
              <button className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-full px-8 py-4 font-black text-lg transition-all hover:shadow-[0_0_20px_rgba(232,201,126,0.4)] group">
                Contact Seller
              </button>

              {/* Report Link */}
              <div className="text-center mt-4">
                <button className="text-white/30 hover:text-white/50 text-sm transition-colors">
                  Report listing
                </button>
              </div>
            </motion.div>
          </div>

          {/* Related Products */}
          {seller && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-12"
            >
              <div className="mb-6">
                <span className="uppercase tracking-widest text-xs text-white/40 font-medium">MORE FROM THIS SELLER</span>
                <h2 className="font-black tracking-tight text-white text-2xl">Related Products</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Related products would be fetched here */}
                <div className="col-span-full text-center py-8">
                  <p className="text-white/50">Loading related products...</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
