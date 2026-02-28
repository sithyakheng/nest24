'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Edit, Trash2, Plus, Search, Filter, Users, ShoppingCart } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  image_url?: string
  created_at: string
  buyer_count?: number
  order_count?: number
}

export default function MyProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      console.log('🔍 Fetching products for seller dashboard...')
      
      // Check Supabase client initialization
      console.log('📡 Supabase client initialized:', !!supabase)
      
      // Get the current authenticated user
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      console.log('👤 Authenticated user:', authUser?.id || 'No user found')
      if (authError) console.log('⚠️ Auth error:', authError)
      
      if (authError || !authUser) {
        console.error('❌ User not authenticated')
        return
      }

      console.log('🏪 Fetching products for seller:', authUser.id)

      // Fetch products simply without orders join
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', authUser.id)
        .order('created_at', { ascending: false })

      console.log('📦 Products query result:', { data: productsData, error: productsError })
      console.log('📊 Products count:', productsData?.length || 0)

      if (productsError) {
        console.error('❌ Products error:', productsError)
        throw productsError
      }

      console.log('✅ Products set successfully:', productsData?.length || 0, 'products')
      setProducts(productsData || [])
    } catch (error) {
      console.error('❌ Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      // Get the current authenticated user
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !authUser) {
        console.error('User not authenticated')
        return
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('seller_id', authUser.id) // Ensure user can only delete their own products

      if (error) throw error
      
      setProducts(prev => prev.filter((p: Product) => p.id !== productId))
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = [...new Set(products.map((p: Product) => p.category))]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/30 border-t-white"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Products</h1>
          <p className="text-white/60">Manage your product listings</p>
        </div>
        
        <motion.a
          href="/seller-dashboard/add-product"
          className="glass px-6 py-3 rounded-2xl text-white font-medium hover:bg-white/20 smooth-transition flex items-center space-x-2 inline-flex mt-4 lg:mt-0"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-5 h-5" />
          <span>Add Product</span>
        </motion.a>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="glass rounded-2xl p-6 mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-[#E0E5E9]/50 smooth-transition"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
            <select
              value={selectedCategory}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:border-[#E0E5E9]/50 smooth-transition appearance-none"
            >
              <option value="">All Categories</option>
              {categories.map((category: string) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="glass rounded-2xl p-12 text-center"
        >
          <div className="w-20 h-20 glass rounded-full flex items-center justify-center mx-auto mb-6">
            <Plus className="w-10 h-10 text-white/60" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
          <p className="text-white/60 mb-6">
            {searchTerm || selectedCategory 
              ? 'Try adjusting your filters' 
              : 'Start by adding your first product'
            }
          </p>
          <motion.a
            href="/seller-dashboard/add-product"
            className="glass px-6 py-3 rounded-2xl text-white font-medium hover:bg-white/20 smooth-transition inline-flex"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            Add Your First Product
          </motion.a>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product: Product, index: number) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="glass rounded-2xl overflow-hidden group"
            >
              {/* Product Image */}
              <div className="h-48 bg-gradient-to-br from-[#E0E5E9]/20 to-[#004E64]/10 flex items-center justify-center">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center">
                    <span className="text-white/60 text-xs">No Image</span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-white mb-1 line-clamp-1">{product.name}</h3>
                <p className="text-white/60 text-sm mb-3 line-clamp-2">{product.description}</p>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[#E0E5E9] font-bold text-lg">${product.price}</span>
                  <span className={`px-2 py-1 rounded-lg text-xs ${
                    product.stock > 0 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                </div>

                {/* Stats */}
                {(product.buyer_count! > 0 || product.order_count! > 0) && (
                  <div className="flex items-center justify-between text-xs text-white/60 mb-3">
                    <span>{product.buyer_count} buyers</span>
                    <span>{product.order_count} orders</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2">
                  <motion.button
                    className="flex-1 glass px-3 py-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 smooth-transition text-sm font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Edit className="w-4 h-4 inline mr-1" />
                    Edit
                  </motion.button>
                  <motion.button
                    onClick={() => handleDelete(product.id)}
                    className="flex-1 glass px-3 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 smooth-transition text-sm font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Trash2 className="w-4 h-4 inline mr-1" />
                    Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
