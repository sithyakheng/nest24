'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, ShoppingCart, Plus, Minus, User, Package, Star } from 'lucide-react'
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
  }
}

export default function ProductDetail() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [seller, setSeller] = useState<Seller | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)

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

  const addToCart = () => {
    if (!product) return

    setAddingToCart(true)
    
    // Get existing cart from localStorage
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]')
    
    // Check if product already in cart
    const existingItem = existingCart.find((item: any) => item.id === product.id)
    
    if (existingItem) {
      // Update quantity
      existingItem.quantity += quantity
    } else {
      // Add new item
      existingCart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        quantity: quantity
      })
    }
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(existingCart))
    
    // Show success message
    showSuccessToast(`${product.name} added to cart!`)
    
    setTimeout(() => {
      setAddingToCart(false)
    }, 1000)
  }

  const showSuccessToast = (message: string) => {
    // Create toast element
    const toast = document.createElement('div')
    toast.className = 'fixed top-4 right-4 glass px-6 py-3 rounded-2xl text-white z-50 animate-pulse'
    toast.textContent = message
    document.body.appendChild(toast)
    
    setTimeout(() => {
      toast.remove()
    }, 3000)
  }

  const updateQuantity = (change: number) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 0)) {
      setQuantity(newQuantity)
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
              <h3 className="font-semibold text-gray-900 mb-4">Seller Information</h3>
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
            </div>

            {/* Quantity Selector */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Quantity</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => updateQuantity(-1)}
                  className="w-12 h-12 glass rounded-2xl flex items-center justify-center hover:bg-[#004E64] hover:text-white smooth-transition"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-xl font-semibold text-gray-900 w-12 text-center">{quantity}</span>
                <button
                  onClick={() => updateQuantity(1)}
                  className="w-12 h-12 glass rounded-2xl flex items-center justify-center hover:bg-[#004E64] hover:text-white smooth-transition"
                  disabled={quantity >= product.stock}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={addToCart}
              disabled={product.stock === 0 || addingToCart}
              className="w-full glass px-8 py-4 rounded-2xl text-[#004E64] font-semibold hover:bg-[#004E64] hover:text-white smooth-transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>{addingToCart ? 'Adding...' : 'Add to Cart'}</span>
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
