'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Phone, Mail, User, Eye } from 'lucide-react'

interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number
    original_price?: number
    discount?: number
    category: string
    stock: number
    image_url?: string
    seller_id: string
    seller?: {
      full_name?: string
      avatar_url?: string
    }
    created_at: string
  }
  size?: 'small' | 'medium' | 'large'
}

export default function ProductCard({ product, size = 'medium' }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const discountPercentage = product.discount && product.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0

  const getStockStatus = () => {
    if (product.stock === 0) return { text: 'Out of Stock', color: 'text-red-400' }
    if (product.stock < 5) return { text: '⚠ Low Stock', color: 'text-amber-400' }
    return { text: '✓ In Stock', color: 'text-teal-400' }
  }

  const sizeClasses = {
    small: 'h-64',
    medium: 'h-80',
    large: 'h-96'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={{ 
        y: -6,
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative bg-white/[0.05] backdrop-blur-3xl border border-white/[0.08] border-t-white/[0.18] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden cursor-pointer"
    >
      {/* Product Image Frame */}
      <div className={`relative ${sizeClasses[size]} overflow-hidden`}>
        {product.image_url ? (
          <motion.div
            animate={{ 
              scale: isHovered ? 1.08 : 1,
              rotateX: isHovered ? 3 : 0
            }}
            transition={{ duration: 0.5 }}
            className="w-full h-full relative"
          >
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
            />
            {/* Subtle Reflection Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.1] via-transparent to-transparent pointer-events-none" />
          </motion.div>
        ) : (
          <div className="w-full h-full bg-white/[0.03] flex items-center justify-center">
            <span className="text-white/20 text-6xl">📦</span>
          </div>
        )}

        {/* Floating Badges */}
        {discountPercentage > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-4 left-4 bg-amber-500/90 backdrop-blur-xl border border-amber-400/30 rounded-full px-3 py-1 text-white text-sm font-black shadow-[0_4px_20px_rgba(232,201,126,0.4)]"
          >
            -{discountPercentage}%
          </motion.div>
        )}

        {product.stock === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-4 right-4 bg-red-500/90 backdrop-blur-xl border border-red-400/30 rounded-full px-3 py-1 text-white text-sm font-black shadow-[0_4px_20px_rgba(255,80,80,0.4)]"
          >
            Out of Stock
          </motion.div>
        )}

        {/* Hover Action Bar */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-4"
            >
              <div className="flex justify-center space-x-3">
                <motion.a
                  href={`/products/${product.id}`}
                  className="bg-teal-500 hover:bg-teal-600 text-white rounded-full p-2 transition-all shadow-[0_4px_20px_rgba(0,78,100,0.4)]"
                  whileTap={{ scale: 0.97 }}
                >
                  <Eye className="w-4 h-4" />
                </motion.a>
                <motion.button
                  className="bg-amber-500 hover:bg-amber-600 text-white rounded-full p-2 transition-all shadow-[0_4px_20px_rgba(232,201,126,0.4)]"
                  whileTap={{ scale: 0.97 }}
                >
                  <MessageCircle className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product Info Panel */}
      <div className="p-4 space-y-3">
        {/* Category & Stock */}
        <div className="flex items-center justify-between">
          <span className="uppercase tracking-widest text-xs text-white/40 font-medium">
            {product.category}
          </span>
          <span className={`text-xs font-medium ${getStockStatus().color}`}>
            {getStockStatus().text}
          </span>
        </div>

        {/* Product Name */}
        <h3 className="font-bold text-white text-lg leading-tight line-clamp-2 group-hover:text-teal-300 transition-colors">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-center space-x-2">
          <span className="font-black text-amber-300 text-xl shadow-[0_0_20px_rgba(232,201,126,0.3)]">
            ${product.price.toFixed(2)}
          </span>
          {product.original_price && product.original_price > product.price && (
            <span className="text-white/30 line-through text-sm">
              ${product.original_price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Seller Chip */}
        {product.seller && (
          <Link
            href={`/seller/${product.seller_id}`}
            className="inline-flex items-center space-x-2 bg-white/[0.08] backdrop-blur-xl border border-white/[0.12] rounded-full px-3 py-1 text-white/60 hover:text-white hover:bg-white/[0.12] transition-all group"
          >
            {product.seller.avatar_url ? (
              <Image
                src={product.seller.avatar_url}
                alt={product.seller.full_name || 'Seller'}
                width={16}
                height={16}
                className="rounded-full object-cover border border-amber-500/30"
              />
            ) : (
              <User className="w-4 h-4" />
            )}
            <span className="text-xs font-medium truncate max-w-[100px]">
              {product.seller.full_name || 'Seller'}
            </span>
          </Link>
        )}
      </div>
    </motion.div>
  )
}
