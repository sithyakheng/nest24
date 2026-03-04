'use client'

import Link from 'next/link'

interface ProductCardProps {
  product: any
}

const getImageUrl = (url: string): string => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `https://oisdppgqifhbtlanglwr.supabase.co/storage/v1/object/public/Product/${url}` 
}

export default function ProductCard({ product }: ProductCardProps) {
  console.log('Product profiles rank:', product.profiles?.rank)
  
  // Determine rank-based styling
  const getRankStyle = () => {
    const rank = product.profiles?.rank
    if (rank === 'premium') {
      return {
        border: '2px solid rgba(232,201,126,0.5)',
        boxShadow: '0 0 30px rgba(232,201,126,0.15)',
        sellerColor: '#E8C97E',
        badgeBg: 'rgba(232,201,126,0.4)',
        badgeBorder: 'rgba(232,201,126,0.6)',
        badgeColor: '#E8C97E',
        badgeIcon: '⭐'
      }
    } else if (rank === 'verified') {
      return {
        border: '2px solid rgba(0,78,100,0.5)',
        boxShadow: '0 0 20px rgba(0,78,100,0.15)',
        sellerColor: '#4DB8CC',
        badgeBg: 'rgba(0,78,100,0.5)',
        badgeBorder: 'rgba(0,78,100,0.7)',
        badgeColor: '#4DB8CC',
        badgeIcon: '✓'
      }
    } else if (rank === 'starter') {
      return {
        border: '2px solid rgba(59,130,246,0.3)',
        boxShadow: '0 0 15px rgba(59,130,246,0.1)',
        sellerColor: '#93c5fd',
        badgeBg: 'rgba(59,130,246,0.4)',
        badgeBorder: 'rgba(59,130,246,0.6)',
        badgeColor: '#93c5fd',
        badgeIcon: '🥉'
      }
    } else {
      return {
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: 'none',
        sellerColor: 'rgba(255,255,255,0.4)',
        badgeBg: 'rgba(255,255,255,0.06)',
        badgeBorder: 'rgba(255,255,255,0.12)',
        badgeColor: 'rgba(255,255,255,0.6)',
        badgeIcon: ''
      }
    }
  }

  const rankStyle = getRankStyle()
  
  return (
    <Link href={`/products/${product.id}`}>
      <div
        style={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: rankStyle.border,
          borderTop: '1px solid rgba(255,255,255,0.22)',
          borderRadius: '20px',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          position: 'relative',
          boxShadow: rankStyle.boxShadow
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = rankStyle.boxShadow ? rankStyle.boxShadow.replace('0 0', '0 8px') : '0 8px rgba(0,0,0,0.4)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = rankStyle.boxShadow
        }}
      >
        <div style={{ height: '200px', overflow: 'hidden', background: 'rgba(255,255,255,0.04)', position: 'relative' }}>
          {product.image_url ? (
            <img
              src={getImageUrl(product.image_url)}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '14px' }}>
              No Image
            </div>
          )}

          {/* Rank Badge - Always rendered outside image conditional */}
          {product.profiles?.rank && (
            <span style={{ 
              position: 'absolute', 
              top: '8px', 
              right: '8px', 
              background: rankStyle.badgeBg, 
              border: `1px solid ${rankStyle.badgeBorder}`, 
              color: rankStyle.badgeColor, 
              fontSize: '10px', 
              fontWeight: '700', 
              padding: '4px 10px', 
              borderRadius: '9999px', 
              backdropFilter: 'blur(8px)', 
              WebkitBackdropFilter: 'blur(8px)' 
            }}>
              {rankStyle.badgeIcon} {product.profiles.rank.charAt(0).toUpperCase() + product.profiles.rank.slice(1)}
            </span>
          )}
        </div>

        <div style={{ padding: '16px' }}>
          <span style={{ color: '#4DB8CC', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600' }}>
            {product.category}
          </span>
          <p style={{ color: 'white', fontWeight: '600', fontSize: '15px', margin: '6px 0', lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.name}
          </p>
          <p style={{ color: '#E8C97E', fontWeight: '900', fontSize: '18px', margin: '0 0 8px 0' }}>
            ${product.price}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0 }}>
            {rankStyle.badgeIcon} {product.profiles?.name || product.profiles?.full_name || 'Seller'}
          </p>
        </div>
      </div>
    </Link>
  )
}
