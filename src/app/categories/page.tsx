'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useLang } from '@/contexts/LanguageContext'

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
  const { t } = useLang()
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
      background: '#f9fafb',
      paddingTop: '100px',
      paddingBottom: '60px'
    }}>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
        
        <p style={{ color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>{t('categories.browse')}</p>
        <h1 style={{ color: '#111827', fontSize: '40px', fontWeight: '900', marginBottom: '40px' }}>{t('categories.title')}</h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {CATEGORIES.map((cat) => (
            <Link href={`/browse?category=${cat.name}`} key={cat.name}>
              <div style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '16px',
                padding: '32px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#f9fafb'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,78,100,0.15)'
                e.currentTarget.style.borderColor = '#004E64'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'white'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'
                e.currentTarget.style.borderColor = '#e5e7eb'
              }}
              >
                <span style={{ fontSize: '40px' }}>{cat.emoji}</span>
                <div>
                  <p style={{ color: '#111827', fontWeight: '700', fontSize: '18px', margin: 0 }}>{cat.name}</p>
                  <p style={{ color: '#6b7280', fontSize: '13px', margin: '4px 0 0 0' }}>
                    {counts[cat.name] || 0} {t('categories.products')}
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
