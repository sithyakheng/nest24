'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Phone, MessageCircle, Mail, User, Package, Star, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  image_url?: string
  seller_id: string
  created_at: string
}

interface Seller {
  id: string
  email: string
  user_metadata?: {
    full_name?: string
    phone_number?: string
    facebook_url?: string
    instagram_url?: string
    whatsapp_url?: string
  }
}

export default function ProductDetail() {
  const params = useParams()
  const router = useRouter()
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
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single()

      if (productError) throw productError

      setProduct(productData)

      // Fetch seller info
      const { data: sellerData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', productData.seller_id)
        .single()
      
      if (sellerData) {
        setSeller({
          id: sellerData.id,
          email: sellerData.email || '',
          user_metadata: sellerData.user_metadata
        })
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#004E64] border-t-transparent"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
          <button
            onClick={() => router.back()}
            className="glass px-6 py-3 rounded-2xl text-[#004E64] hover:bg-[#004E64] hover:text-white smooth-transition"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E0E5E9]/30 to-transparent">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="glass px-4 py-2 rounded-2xl text-[#004E64] hover:bg-[#004E64] hover:text-white smooth-transition inline-flex items-center space-x-2 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="glass rounded-3xl overflow-hidden">
              <div className="h-96 bg-gradient-to-br from-[#E0E5E9] to-[#004E64]/10 flex items-center justify-center">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-24 h-24 text-[#004E64]/30" />
                )}
              </div>
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
              <p className="text-xl text-gray-600 mb-6">{product.description}</p>
              
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold text-[#004E64]">${product.price}</span>
                <span className={`px-3 py-1 rounded-lg text-sm ${
                  product.stock > 0 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-red-100 text-red-600'
                }`}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>

              <div className="flex items-center space-x-2 text-gray-600 mb-8">
                <Package className="w-4 h-4" />
                <span>{product.category}</span>
              </div>
            </div>

            {/* Seller Info */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold text-gray-900 mb-6">Seller Information</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 glass rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-[#004E64]" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {seller?.user_metadata?.full_name || seller?.email || 'Unknown Seller'}
                    </p>
                    <p className="text-sm text-gray-600">Verified Seller</p>
                  </div>
                </div>
                
                {seller?.user_metadata?.phone_number && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{seller.user_metadata.phone_number}</span>
                  </div>
                )}
                
                {seller?.email && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{seller.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Buttons */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Contact Seller</h3>
              
              {seller?.user_metadata?.phone_number && (
                <>
                  <a
                    href={`tel:${seller.user_metadata.phone_number}`}
                    className="w-full glass px-6 py-4 rounded-2xl text-[#004E64] font-semibold hover:bg-[#004E64] hover:text-white smooth-transition flex items-center justify-center space-x-2"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Call Seller</span>
                  </a>
                  
                  <a
                    href={`https://wa.me/${seller.user_metadata.phone_number.replace(/[^\d]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full glass px-6 py-4 rounded-2xl text-green-600 font-semibold hover:bg-green-600 hover:text-white smooth-transition flex items-center justify-center space-x-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>WhatsApp</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </>
              )}
              
              {seller?.email && (
                <a
                  href={`mailto:${seller.email}`}
                  className="w-full glass px-6 py-4 rounded-2xl text-[#004E64] font-semibold hover:bg-[#004E64] hover:text-white smooth-transition flex items-center justify-center space-x-2"
                >
                  <Mail className="w-5 h-5" />
                  <span>Email Seller</span>
                </a>
              )}
              
              {/* Social Media Links */}
              {seller?.user_metadata?.facebook_url && (
                <a
                  href={seller.user_metadata.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full glass px-6 py-3 rounded-2xl text-blue-600 font-medium hover:bg-blue-600 hover:text-white smooth-transition flex items-center justify-center space-x-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Facebook</span>
                </a>
              )}
              
              {seller?.user_metadata?.instagram_url && (
                <a
                  href={seller.user_metadata.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full glass px-6 py-3 rounded-2xl text-pink-600 font-medium hover:bg-pink-600 hover:text-white smooth-transition flex items-center justify-center space-x-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Instagram</span>
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
