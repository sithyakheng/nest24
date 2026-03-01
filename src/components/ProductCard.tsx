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

const getImageUrl = (image_url: string): string | null => {
  if (!image_url) return null
  if (image_url.startsWith('http')) return image_url
  return `https://oisdppgqifhbtlanglwr.supabase.co/storage/v1/object/public/Product/${image_url}` 
}

export default function ProductCard({ product }: ProductCardProps) {
  const getStockStatus = () => {
    if (product.stock === 0) return { text: 'Out of Stock', color: 'text-red-400' }
    if (product.stock < 5) return { text: 'Low Stock', color: 'text-amber-400' }
    return { text: 'In Stock', color: 'text-teal-400' }
  }

  return (
    <motion.div
      whileHover={{ 
        translateY: -2,
        scale: 1.01,
        transition: { duration: 0.2 }
      }}
      className="rounded-2xl p-5 transition-all duration-200 cursor-pointer shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
      style={{
        background: 'rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(24px) saturate(180%) brightness(110%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%) brightness(110%)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderTop: '1px solid rgb(255, 255, 255, 0.2)',
        borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      <Link href={`/products/${product.id}`}>
        <div className="flex space-x-4">
          {/* LEFT - Image */}
          <div className="w-48 h-36 rounded-xl overflow-hidden flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.06)' }}>
            {product.image_url && getImageUrl(product.image_url) ? (
              <img
                src={getImageUrl(product.image_url)!}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-white/20 text-xs">No Image</span>
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
              <span className="text-amber-300 font-black text-xl shadow-[0_0_15px_rgba(232,201,126,0.2)]">
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
