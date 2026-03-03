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
  
  return (
    <Link href={`/products/${product.id}`}>
      <div
        style={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderTop: '1px solid rgba(255,255,255,0.22)',
          borderRadius: '20px',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          position: 'relative'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.4)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
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

          {product.profiles?.rank === 'starter' && (
            <span style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(59,130,246,0.4)', border: '1px solid rgba(59,130,246,0.6)', color: '#93c5fd', fontSize: '10px', fontWeight: '700', padding: '4px 10px', borderRadius: '9999px', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>🥉 Starter</span>
          )}
          {product.profiles?.rank === 'verified' && (
            <span style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,78,100,0.5)', border: '1px solid rgba(0,78,100,0.7)', color: '#4DB8CC', fontSize: '10px', fontWeight: '700', padding: '4px 10px', borderRadius: '9999px', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>✓ Verified</span>
          )}
          {product.profiles?.rank === 'premium' && (
            <span style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(232,201,126,0.4)', border: '1px solid rgba(232,201,126,0.6)', color: '#E8C97E', fontSize: '10px', fontWeight: '700', padding: '4px 10px', borderRadius: '9999px', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>⭐ Premium</span>
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
            by {product.profiles?.name || product.profiles?.full_name || 'Seller'}
          </p>
        </div>
      </div>
    </Link>
  )
}
