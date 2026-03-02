'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const CATEGORIES = [
  { name: 'Electronics', emoji: '📱' },
  { name: 'Fashion', emoji: '👗' },
  { name: 'Home Living', emoji: '🏠' },
  { name: 'Beauty', emoji: '💄' },
  { name: 'Food', emoji: '🍜' },
  { name: 'Gaming', emoji: '🎮' },
  { name: 'Other', emoji: '📦' },
]

export default function CategoriesPage() {
  const [counts, setCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    async function fetchCounts() {
      const { data } = await supabase
        .from('products')
        .select('category')
      
      const countMap: Record<string, number> = {}
      data?.forEach((p: any) => {
        countMap[p.category] = (countMap[p.category] || 0) + 1
      })
      setCounts(countMap)
    }
    fetchCounts()
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080a0f',
      paddingTop: '100px',
      paddingBottom: '60px',
      position: 'relative'
    }}>
      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-150px', left: '-100px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,78,100,0.4) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '-150px', right: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,201,126,0.25) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>BROWSE</p>
        <h1 style={{ color: 'white', fontSize: '40px', fontWeight: '900', marginBottom: '40px' }}>Categories</h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {CATEGORIES.map((cat) => (
            <Link href={`/browse?category=${cat.name}`} key={cat.name}>
              <div style={{
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderTop: '1px solid rgba(255,255,255,0.22)',
                borderRadius: '20px',
                padding: '32px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.10)'
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.4)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
              >
                <span style={{ fontSize: '40px' }}>{cat.emoji}</span>
                <div>
                  <p style={{ color: 'white', fontWeight: '700', fontSize: '18px', margin: 0 }}>{cat.name}</p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '4px 0 0 0' }}>
                    {counts[cat.name] || 0} products
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
