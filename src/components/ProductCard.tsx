'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { User } from 'lucide-react'

interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number
    original_price?: number
    category: string
    stock: number
    image_url?: string
    description?: string
    seller_id: string
    seller?: {
      full_name?: string
      avatar_url?: string
    }
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const getStockStatus = () => {
    if (product.stock === 0) return { text: 'Out of Stock', color: 'text-red-400' }
    if (product.stock < 5) return { text: 'Low Stock', color: 'text-amber-400' }
    return { text: 'In Stock', color: 'text-teal-400' }
  }

  return (
    <motion.div
      whileHover={{ translateY: -2, backgroundColor: 'rgba(255,255,255,0.06)' }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-5 transition-all duration-200 cursor-pointer"
    >
      <Link href={`/products/${product.id}`}>
        <div className="flex space-x-4">
          {/* LEFT - Image */}
          <div className="relative w-32 h-24 flex-shrink-0">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover rounded-xl"
              />
            ) : (
              <div className="w-full h-full bg-white/[0.03] rounded-xl flex items-center justify-center">
                <span className="text-white/20 text-2xl">📦</span>
              </div>
            )}
          </div>

          {/* RIGHT - Content */}
          <div className="flex-1 min-w-0">
            {/* Category */}
            <div className="uppercase text-xs text-teal-400 font-medium mb-1">
              {product.category}
            </div>

            {/* Product Name */}
            <h3 className="font-semibold text-white text-lg leading-tight mb-2 line-clamp-1">
              {product.name}
            </h3>

            {/* Description */}
            {product.description && (
              <p className="text-white/50 text-sm leading-relaxed mb-3 line-clamp-2">
                {product.description}
              </p>
            )}

            {/* Price */}
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-amber-300 font-black text-xl">
                ${product.price.toFixed(2)}
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-white/30 line-through text-sm">
                  ${product.original_price.toFixed(2)}
                </span>
              )}
              <span className={`text-xs font-medium ${getStockStatus().color}`}>
                {getStockStatus().text}
              </span>
            </div>

            {/* Seller */}
            <div className="flex items-center space-x-2 text-white/40 text-xs">
              <User className="w-3 h-3" />
              <span>{product.seller?.full_name || 'Seller'}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
