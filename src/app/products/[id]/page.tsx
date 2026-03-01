'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { MessageCircle, Phone, Mail, User, Package } from 'lucide-react'
import PageWrapper from '@/components/PageWrapper'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'

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
      <PageWrapper>
        <Navbar />
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-96 bg-white/[0.04] rounded-2xl" />
            <div className="h-8 bg-white/[0.04] rounded-xl w-3/4" />
            <div className="h-6 bg-white/[0.04] rounded-xl w-1/2" />
          </div>
        </div>
      </PageWrapper>
    )
  }

  if (!product) {
    return (
      <PageWrapper>
        <Navbar />
        <div className="p-6 text-center">
          <p className="text-white/50">Product not found</p>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
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
            <div className="relative aspect-video rounded-2xl border border-white/[0.08] overflow-hidden bg-white/[0.03]">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-16 h-16 text-white/20" />
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
                  <div className="w-12 h-12 bg-white/[0.08] rounded-full flex items-center justify-center flex-shrink-0">
                    {seller.avatar_url ? (
                      <img
                        src={seller.avatar_url}
                        alt={seller.full_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-white/60" />
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

                {/* Contact Icons */}
                <div className="flex items-center space-x-3 pt-4 border-t border-white/[0.06]">
                  {seller.phone && (
                    <a
                      href={`tel:${seller.phone}`}
                      className="w-10 h-10 bg-white/[0.08] rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.12] transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                  
                  {seller.whatsapp && (
                    <a
                      href={`https://wa.me/${seller.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-white/[0.08] rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.12] transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  )}
                  
                  {seller.email && (
                    <a
                      href={`mailto:${seller.email}`}
                      className="w-10 h-10 bg-white/[0.08] rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.12] transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
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
    </PageWrapper>
  )
}
