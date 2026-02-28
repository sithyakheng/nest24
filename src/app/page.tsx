'use client'

import { useState, useEffect } from 'react'
import { motion, useScroll, useInView, useSpring } from 'framer-motion'
import Link from 'next/link'
import { Search, ShoppingCart, Home as HomeIcon, Laptop, Shirt, ShoppingBag, ArrowRight, Package, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useCart } from '@/contexts/CartContext'

interface Product {
  id: string
  name: string
  price: number
  description?: string
  image_url?: string
  seller_id: string
  created_at: string
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      console.log('🔍 Fetching all products for homepage...')
      
      // Check Supabase client initialization
      console.log('📡 Supabase client initialized:', !!supabase)
      
      // Check current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      console.log('👤 Current session:', session?.user?.id || 'No active session')
      if (sessionError) console.log('⚠️ Session error:', sessionError)

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('📦 Products query result:', { data, error })
      console.log('📊 Products count:', data?.length || 0)

      if (error) {
        console.error('❌ Supabase error:', error)
        throw error
      }
      
      setProducts(data || [])
      console.log('✅ Products set successfully:', data?.length || 0, 'products')
    } catch (error) {
      console.error('❌ Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { name: 'Home Living', icon: HomeIcon, color: 'bg-blue-100 text-blue-600' },
    { name: 'Tech Essentials', icon: Laptop, color: 'bg-purple-100 text-purple-600' },
    { name: 'Fashion', icon: Shirt, color: 'bg-pink-100 text-pink-600' },
    { name: 'Accessories', icon: ShoppingBag, color: 'bg-green-100 text-green-600' }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 10
      }
    }
  }

  return (
    <div className="min-h-screen">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-[#004E64] z-50 origin-left"
        style={{ scaleX }}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#004E64]/20 via-transparent to-[#E0E5E9]/20"></div>
          <motion.div
            className="absolute top-20 left-20 w-96 h-96 bg-[#004E64] rounded-full mix-blend-multiply filter blur-3xl opacity-10"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          <motion.div
            className="absolute bottom-20 right-20 w-96 h-96 bg-[#E0E5E9] rounded-full mix-blend-multiply filter blur-3xl opacity-20"
            animate={{
              x: [0, -100, 0],
              y: [0, 100, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Build Your
                <span className="block text-[#004E64]">Perfect Nest</span>
              </h1>
              <motion.p
                className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Curated products. Modern living. Trusted quality in Cambodia.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="glass px-8 py-4 rounded-2xl text-[#004E64] hover:bg-[#004E64] hover:text-white smooth-transition font-semibold text-lg flex items-center justify-center space-x-2 glow-hover"
                >
                  <span>Explore Collection</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="glass px-8 py-4 rounded-2xl text-[#004E64] hover:bg-[#004E64] hover:text-white smooth-transition font-semibold text-lg flex items-center justify-center space-x-2 glow-hover"
                >
                  <span>View Deals</span>
                  <Clock className="w-5 h-5" />
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Right Content - Floating Products */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="relative">
                {/* Floating Product Cards */}
                <motion.div
                  className="absolute top-0 left-0 w-64 h-64 glass rounded-3xl p-6 floating"
                  style={{ animationDelay: '0s' }}
                >
                  <div className="w-full h-32 bg-gradient-to-br from-[#E0E5E9] to-[#004E64]/20 rounded-2xl mb-4"></div>
                  <h3 className="font-semibold text-gray-900 mb-2">Premium Collection</h3>
                  <p className="text-gray-600 text-sm">Curated items for modern living</p>
                </motion.div>

                <motion.div
                  className="absolute top-20 right-0 w-56 h-56 glass rounded-3xl p-6 floating"
                  style={{ animationDelay: '2s' }}
                >
                  <div className="w-full h-28 bg-gradient-to-br from-[#004E64]/20 to-[#E0E5E9] rounded-2xl mb-4"></div>
                  <h3 className="font-semibold text-gray-900 mb-2">Tech Essentials</h3>
                  <p className="text-gray-600 text-sm">Latest gadgets & devices</p>
                </motion.div>

                <motion.div
                  className="absolute bottom-0 left-10 w-60 h-60 glass rounded-3xl p-6 floating"
                  style={{ animationDelay: '4s' }}
                >
                  <div className="w-full h-30 bg-gradient-to-br from-[#E0E5E9] to-[#004E64]/10 rounded-2xl mb-4"></div>
                  <h3 className="font-semibold text-gray-900 mb-2">Home & Living</h3>
                  <p className="text-gray-600 text-sm">Transform your space</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Categories</h2>
            <p className="text-xl text-gray-600">Explore our curated collections</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {categories.map((category, index) => {
              const Icon = category.icon
              return (
                <motion.div
                  key={category.name}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -10 }}
                  whileTap={{ scale: 0.98 }}
                  className="glass rounded-3xl p-8 cursor-pointer glow-hover smooth-transition"
                >
                  <div className={`w-20 h-20 ${category.color} rounded-2xl flex items-center justify-center mb-6 mx-auto`}>
                    <Icon className="w-10 h-10" />
                  </div>
                  <h3 className="text-center font-semibold text-gray-900 text-xl mb-2">{category.name}</h3>
                  <p className="text-center text-gray-600 text-sm">Discover premium items</p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#E0E5E9]/30 to-transparent">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-xl text-gray-600">Handpicked items for quality living</p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#004E64] border-t-transparent"></div>
            </div>
          ) : products.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 glass rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-12 h-12 text-[#004E64]" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Coming Soon</h3>
              <p className="text-gray-600 text-lg">Premium products are on their way</p>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {products.slice(0, 8).map((product) => (
                <motion.div
                  key={product.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -10 }}
                  className="glass rounded-3xl overflow-hidden glow-hover smooth-transition cursor-pointer"
                >
                  <Link href={`/products/${product.id}`}>
                    <div className="h-48 bg-gradient-to-br from-[#E0E5E9] to-[#004E64]/10 flex items-center justify-center">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-12 h-12 text-[#004E64]/30" />
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-2 text-lg">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {product.description || 'Premium quality item'}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-[#004E64] font-bold text-xl">${product.price}</span>
                      </div>
                    </div>
                  </Link>
                  <div className="px-6 pb-6">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        addToCart({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          image_url: product.image_url,
                          quantity: 1
                        })
                      }}
                      className="w-full glass px-4 py-2 rounded-xl text-[#004E64] hover:bg-[#004E64] hover:text-white smooth-transition text-sm font-medium flex items-center justify-center space-x-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Special Deals Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-dark rounded-3xl p-12 text-center text-white glow"
          >
            <h2 className="text-4xl font-bold mb-4">Special Deals</h2>
            <p className="text-xl mb-8 opacity-90">Exclusive offers for premium members</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="glass px-8 py-4 rounded-2xl text-white hover:bg-white/20 smooth-transition font-semibold text-lg"
            >
              View All Deals
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass py-12 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-[#004E64] mb-4">NESTKH</div>
            <p className="text-gray-600 mb-6">Premium lifestyle marketplace</p>
            <div className="flex justify-center space-x-8 text-sm text-gray-500 mb-6">
              <a href="#" className="hover:text-[#004E64] smooth-transition">About</a>
              <a href="#" className="hover:text-[#004E64] smooth-transition">Contact</a>
              <a href="#" className="hover:text-[#004E64] smooth-transition">Terms</a>
              <a href="#" className="hover:text-[#004E64] smooth-transition">Privacy</a>
            </div>
            <div className="text-sm text-gray-500">
              © 2024 NESTKH. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
