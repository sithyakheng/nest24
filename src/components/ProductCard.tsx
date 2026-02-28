'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MessageCircle, Phone, Mail, User } from 'lucide-react'

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

  const sizeClasses = {
    small: 'max-w-xs',
    medium: 'max-w-sm',
    large: 'max-w-md'
  }

  return (
    <motion.div
      className={`${sizeClasses[size]} group cursor-pointer`}
      whileHover={{ 
        y: -4,
        boxShadow: '0 20px 40px rgba(0,78,100,0.3)'
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.id}`}>
        <div className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300">
          
          {/* Image Area */}
          <div className="relative h-48 overflow-hidden">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-white/[0.03] flex items-center justify-center">
                <span className="text-white/30 text-4xl">📦</span>
              </div>
            )}
            
            {/* Discount Badge */}
            {discountPercentage > 0 && (
              <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-black px-2 py-1 rounded-full">
                {discountPercentage}% OFF
              </div>
            )}
            
            {/* Out of Stock Badge */}
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-semibold">Out of Stock</span>
              </div>
            )}
          </div>

          {/* Info Area */}
          <div className="bg-white/[0.03] p-4">
            {/* Category Label */}
            <div className="uppercase tracking-widest text-xs text-teal-400 font-medium mb-2">
              {product.category}
            </div>
            
            {/* Product Name */}
            <h3 className="font-semibold text-white text-base mb-3 line-clamp-2 leading-tight">
              {product.name}
            </h3>
            
            {/* Price Row */}
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-amber-300 font-black text-xl">
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
                className="inline-flex items-center space-x-2 bg-white/[0.06] border border-white/[0.12] rounded-full px-3 py-1 text-xs hover:bg-white/[0.10] transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {product.seller.avatar_url ? (
                  <Image
                    src={product.seller.avatar_url}
                    alt={product.seller.full_name || 'Seller'}
                    width={20}
                    height={20}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-white/50" />
                )}
                <span className="text-white/50">
                  by {product.seller.full_name || 'Seller'}
                </span>
              </Link>
            )}
          </div>

          {/* Hover Action Bar */}
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: isHovered ? 0 : 100 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-3 flex justify-center space-x-2"
          >
            <button
              className="bg-teal-500 hover:bg-teal-600 text-white rounded-full px-4 py-2 text-xs font-medium transition-colors"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                window.location.href = `/products/${product.id}`
              }}
            >
              View Product
            </button>
            <button
              className="bg-white/[0.10] border border-white/[0.20] text-white rounded-full px-4 py-2 text-xs font-medium hover:bg-white/[0.20] transition-colors"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                // Contact seller logic here
              }}
            >
              Contact Seller
            </button>
          </motion.div>
        </div>
      </Link>
    </motion.div>
  )
}
