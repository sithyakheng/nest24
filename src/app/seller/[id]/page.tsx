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
  Package,
  Calendar,
  MapPin
} from 'lucide-react'
import PageWrapper from '@/components/PageWrapper'
import ProductCard from '@/components/ProductCard'
import { supabase } from '@/lib/supabase'

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
  created_at?: string
}

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
}

export default function SellerProfilePage() {
  const params = useParams()
  const [seller, setSeller] = useState<Seller | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchSellerData()
    }
  }, [params.id])

  const fetchSellerData = async () => {
    try {
      // Fetch seller profile
      const { data: sellerData, error: sellerError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', params.id)
        .single()

      if (sellerError) throw sellerError

      setSeller(sellerData)

      // Fetch seller's products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', params.id)
        .order('created_at', { ascending: false })

      setProducts(productsData || [])
    } catch (error) {
      console.error('Error fetching seller data:', error)
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

  if (!seller) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white">Seller not found</div>
        </div>
      </PageWrapper>
    )
  }

  const memberSince = seller.created_at 
    ? new Date(seller.created_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      })
    : 'Unknown'

  const productCategories = [...new Set(products.map(p => p.category))]

  return (
    <PageWrapper>
      <div className="pt-24 px-6 pb-12">
        
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto mb-12"
        >
          <div className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] rounded-2xl p-8">
            
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
              
              {/* Large Avatar */}
              <div className="flex-shrink-0">
                {seller.avatar_url ? (
                  <div className="relative">
                    <Image
                      src={seller.avatar_url}
                      alt={seller.full_name || 'Seller'}
                      width={96}
                      height={96}
                      className="rounded-full object-cover border-2 border-amber-500/30"
                    />
                    <div className="absolute inset-0 rounded-full border-2 border-amber-500/30 animate-pulse"></div>
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-white/[0.12] rounded-full flex items-center justify-center border-2 border-amber-500/30">
                    <span className="text-white text-3xl font-bold">
                      {seller.full_name?.[0] || 'S'}
                    </span>
                  </div>
                )}
              </div>

              {/* Seller Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="font-black text-white text-3xl mb-2">
                  {seller.full_name || 'Seller'}
                </h1>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                  <span className="bg-teal-500/20 border border-teal-500/30 rounded-full px-3 py-1 text-sm text-teal-400 font-medium">
                    Verified Seller
                  </span>
                  <span className="bg-white/[0.06] border border-white/[0.12] rounded-full px-3 py-1 text-sm text-white/60">
                    Member Since {memberSince}
                  </span>
                  <span className="bg-white/[0.06] border border-white/[0.12] rounded-full px-3 py-1 text-sm text-white/60">
                    {productCategories.length} Categories
                  </span>
                </div>

                {seller.bio && (
                  <p className="text-white/50 max-w-md leading-relaxed">
                    {seller.bio}
                  </p>
                )}

                {/* Contact Icons */}
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
                  {seller.phone && (
                    <a
                      href={`tel:${seller.phone}`}
                      className="bg-white/[0.06] border border-white/[0.12] rounded-full p-3 text-white/60 hover:text-white hover:bg-white/[0.10] transition-all group hover:bg-green-600/20"
                    >
                      <Phone className="w-5 h-5" />
                    </a>
                  )}
                  
                  {seller.whatsapp && (
                    <a
                      href={`https://wa.me/${seller.whatsapp.replace(/[^\d]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/[0.06] border border-white/[0.12] rounded-full p-3 text-white/60 hover:text-white hover:bg-white/[0.10] transition-all group hover:bg-green-600/20"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </a>
                  )}
                  
                  {seller.facebook && (
                    <a
                      href={seller.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/[0.06] border border-white/[0.12] rounded-full p-3 text-white/60 hover:text-white hover:bg-white/[0.10] transition-all group hover:bg-indigo-600/20"
                    >
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}
                  
                  {seller.instagram && (
                    <a
                      href={seller.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/[0.06] border border-white/[0.12] rounded-full p-3 text-white/60 hover:text-white hover:bg-white/[0.10] transition-all group hover:bg-pink-600/20"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  
                  {seller.telegram && (
                    <a
                      href={`https://t.me/${seller.telegram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/[0.06] border border-white/[0.12] rounded-full p-3 text-white/60 hover:text-white hover:bg-white/[0.10] transition-all group hover:bg-blue-600/20"
                    >
                      <Send className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Products Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="mb-6">
            <span className="uppercase tracking-widest text-xs text-white/40 font-medium">LISTINGS</span>
            <h2 className="font-black tracking-tight text-white text-2xl">
              Products by {seller.full_name || 'Seller'}
            </h2>
          </div>

          {products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] rounded-2xl p-12 text-center max-w-md mx-auto"
            >
              <Package className="w-12 h-12 text-white/30 mx-auto mb-4" />
              <h3 className="font-black text-white text-xl mb-2">No products yet</h3>
              <p className="text-white/50 mb-6">
                This seller hasn't listed any products yet. Check back soon!
              </p>
              <Link
                href="/browse"
                className="inline-block bg-teal-500 hover:bg-teal-600 text-white rounded-full px-6 py-3 font-medium transition-colors"
              >
                Browse Other Products
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, index) => (
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
        </motion.div>
      </div>
    </PageWrapper>
  )
}
