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
      rank?: string
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

  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.06)',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderTop: '1px solid rgba(255, 255, 255, 0.22)',
    boxShadow: `
      0 8px 32px rgba(0, 0, 0, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.15),
      inset 0 -1px 0 rgba(255, 255, 255, 0.2)
    `,
    borderRadius: '20px'
  }

  const glassHoverStyle = {
    background: 'rgba(255, 255, 255, 0.10)',
    backdropFilter: 'blur(24px) saturate(200%)',
    WebkitBackdropFilter: 'blur(24px) saturate(200%)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    borderTop: '1px solid rgba(255, 255, 255, 0.32)',
    boxShadow: `
      0 16px 48px rgba(0, 0, 0, 0.6),
      inset 0 1px 0 rgba(255, 255, 255, 0.25),
      inset 0 -1px 0 rgba(255, 255, 255, 0.3),
      0 0 40px rgba(0, 78, 100, 0.2)
    `,
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        translateY: -6,
        transition: { duration: 0.3 }
      }}
      className="cursor-pointer smooth-transition"
      style={glassStyle}
      onHoverStart={(e) => {
        const target = e.currentTarget as HTMLDivElement
        Object.assign(target.style, glassHoverStyle)
      }}
      onHoverEnd={(e) => {
        const target = e.currentTarget as HTMLDivElement
        Object.assign(target.style, glassStyle)
      }}
    >
      <Link href={`/products/${product.id}`}>
        {/* Image Area */}
        <div style={{ position: 'relative' }} className="h-48 overflow-hidden rounded-t-2xl">
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
            <div className="w-full h-full flex items-center justify-center bg-black/20">
              <span className="text-white/20 text-sm">No Image</span>
            </div>
          )}
          
          {/* Rank Badges */}
          {product.seller?.rank === 'starter' && (
            <span style={{
              position: 'absolute', top: '8px', right: '8px',
              background: 'rgba(59,130,246,0.3)',
              border: '1px solid rgba(59,130,246,0.5)',
              color: '#93c5fd', fontSize: '10px', fontWeight: '700',
              padding: '3px 8px', borderRadius: '9999px',
              backdropFilter: 'blur(8px)'
            }}>🥉 Starter</span>
          )}
          {product.seller?.rank === 'verified' && (
            <span style={{
              position: 'absolute', top: '8px', right: '8px',
              background: 'rgba(0,78,100,0.4)',
              border: '1px solid rgba(0,78,100,0.6)',
              color: '#4DB8CC', fontSize: '10px', fontWeight: '700',
              padding: '3px 8px', borderRadius: '9999px',
              backdropFilter: 'blur(8px)'
            }}>✓ Verified</span>
          )}
          {product.seller?.rank === 'premium' && (
            <span style={{
              position: 'absolute', top: '8px', right: '8px',
              background: 'rgba(232,201,126,0.3)',
              border: '1px solid rgba(232,201,126,0.5)',
              color: '#E8C97E', fontSize: '10px', fontWeight: '700',
              padding: '3px 8px', borderRadius: '9999px',
              backdropFilter: 'blur(8px)'
            }}>⭐ Premium</span>
          )}
        </div>

        {/* Info Area */}
        <div 
          className="p-4"
          style={{
            background: 'rgba(0,0,0,0.1)',
            borderBottomLeftRadius: '20px',
            borderBottomRightRadius: '20px'
          }}
        >
          {/* Category */}
          <div className="uppercase text-xs text-teal-400 font-medium mb-2">
            {product.category}
          </div>

          {/* Product Name */}
          <h3 className="font-semibold text-white text-lg leading-tight mb-3 line-clamp-2">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center space-x-2 mb-3">
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
          <div className="flex items-center space-x-2 text-white/35 text-xs">
            <User className="w-3 h-3" />
            <span>{product.seller?.full_name || 'Seller'}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
