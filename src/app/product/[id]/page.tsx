'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ArrowLeft, Heart, ShoppingCart, Star, Phone, Facebook, Instagram, MessageCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import SellerContactButtons from '@/components/SellerContactButtons'

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

interface SellerProfile {
  phone_number?: string
  facebook_url?: string
  instagram_url?: string
  whatsapp_url?: string
  full_name?: string
}

export default function ProductPage() {
  const [product, setProduct] = useState<Product | null>(null)
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const params = useParams()
  const router = useRouter()
  
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  const backgroundX = useSpring(useTransform(mouseX, [0, 1], [-10, 10]), { stiffness: 300, damping: 30 })
  const backgroundY = useSpring(useTransform(mouseY, [0, 1], [-10, 10]), { stiffness: 300, damping: 30 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      const { innerWidth, innerHeight } = window
      mouseX.set(clientX / innerWidth)
      mouseY.set(clientY / innerHeight)
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  useEffect(() => {
    fetchProduct()
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

      // Fetch seller profile
      const { data: sellerData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', productData.seller_id)
        .single()

      setSellerProfile(sellerData)
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    // Add to cart logic here
    console.log('Added to cart:', product?.name, quantity)
  }

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/30 border-t-white"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Product not found</h2>
          <button
            onClick={() => router.push('/')}
            className="glass px-6 py-3 rounded-2xl text-white hover:bg-white/20 smooth-transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#004E64] via-[#004E64]/90 to-[#003a47]">
      {/* 3D Animated Background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-[#E0E5E9]/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          style={{
            x: backgroundX,
            y: backgroundY,
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-[#004E64]/20 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          style={{
            x: backgroundX,
            y: backgroundY,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-[#E0E5E9]/5 rounded-full blur-2xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          style={{
            x: backgroundX,
            y: backgroundY,
          }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6"
        >
          <motion.button
            onClick={() => router.back()}
            className="glass px-4 py-2 rounded-2xl text-white hover:bg-white/20 smooth-transition flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </motion.button>
        </motion.div>

        {/* Product Content */}
        <div className="max-w-7xl mx-auto px-6 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="glass rounded-[28px] p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-[28px]"></div>
                <div className="relative z-10">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-96 object-cover rounded-2xl"
                    />
                  ) : (
                    <div className="w-full h-96 bg-gradient-to-br from-[#E0E5E9]/20 to-[#004E64]/10 rounded-2xl flex items-center justify-center">
                      <span className="text-white/40 text-6xl font-bold">
                        {product.name[0]}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Product Details */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Product Info */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-3xl font-bold text-white">{product.name}</h1>
                  <motion.button
                    onClick={handleToggleFavorite}
                    className={`p-3 glass rounded-2xl smooth-transition ${
                      isFavorite ? 'text-red-400' : 'text-white/60'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
                  </motion.button>
                </div>

                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                    <span className="text-white/60 text-sm ml-2">(4.8)</span>
                  </div>
                  <span className="text-white/40">•</span>
                  <span className="text-white/60">{product.category}</span>
                </div>

                <p className="text-white/80 mb-6">{product.description}</p>

                <div className="flex items-center space-x-4 mb-6">
                  <span className="text-3xl font-bold text-[#E0E5E9]">${product.price}</span>
                  {product.stock > 0 ? (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm">
                      {product.stock} in stock
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm">
                      Out of stock
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center space-x-4">
                <span className="text-white/80">Quantity:</span>
                <div className="flex items-center glass rounded-2xl overflow-hidden">
                  <motion.button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-white/80 hover:text-white smooth-transition"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    -
                  </motion.button>
                  <span className="px-4 py-2 text-white font-medium">{quantity}</span>
                  <motion.button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-4 py-2 text-white/80 hover:text-white smooth-transition"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    +
                  </motion.button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <motion.button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full glass px-6 py-4 rounded-2xl text-white font-semibold hover:bg-[#E0E5E9]/20 smooth-transition flex items-center justify-center space-x-2 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98, y: 0 }}
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Add to Cart</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#E0E5E9]/10 to-transparent opacity-0 group-hover:opacity-100 smooth-transition"></div>
              </motion.button>

              {/* Seller Contact Buttons */}
              {sellerProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="glass rounded-[24px] p-6"
                >
                  <SellerContactButtons
                    phoneNumber={sellerProfile.phone_number}
                    facebookUrl={sellerProfile.facebook_url}
                    instagramUrl={sellerProfile.instagram_url}
                    whatsappUrl={sellerProfile.whatsapp_url}
                  />
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
