'use client'

import Link from 'next/link'
import { useLang } from '@/contexts/LanguageContext'

export default function AboutPage() {
  const { t } = useLang()
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f9fafb',
      paddingTop: '100px',
      paddingBottom: '60px'
    }}>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>

        {/* Hero */}
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '24px',
          padding: '48px',
          marginBottom: '24px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <span style={{
            display: 'inline-block',
            background: 'rgba(0,78,100,0.1)',
            border: '1px solid rgba(0,78,100,0.2)',
            color: '#004E64',
            fontSize: '12px',
            fontWeight: '600',
            padding: '6px 16px',
            borderRadius: '9999px',
            marginBottom: '24px',
            letterSpacing: '0.05em'
          }}>
            {t('about.badge')}
          </span>
          <h1 style={{ color: '#111827', fontSize: '42px', fontWeight: '900', margin: '0 0 16px 0' }}>
            {t('about.title')} NestKH
          </h1>
          <p style={{ color: '#6b7280', fontSize: '17px', lineHeight: '1.7', fontWeight: '300', margin: 0 }}>
            {t('about.desc')}
          </p>
        </div>

        {/* Mission cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {[
            { emoji: '🤝', title: 'Trust', desc: 'Every seller is verified and real' },
            { emoji: '🇰🇭', title: 'Local', desc: 'Supporting Cambodian businesses' },
            { emoji: '💎', title: 'Quality', desc: 'Premium products only' },
            { emoji: '⚡', title: 'Simple', desc: 'Buy direct from sellers' },
          ].map((item) => (
            <div key={item.title} style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <span style={{ fontSize: '32px' }}>{item.emoji}</span>
              <p style={{ color: '#111827', fontWeight: '700', fontSize: '16px', margin: '12px 0 4px 0' }}>{item.title}</p>
              <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '24px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{ color: '#111827', fontSize: '28px', fontWeight: '900', margin: '0 0 12px 0' }}>
            {t('about.ready')}
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            {t('about.ready')}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/browse">
              <button style={{
                background: 'linear-gradient(135deg, #E8C97E, #F0B429)',
                color: 'black',
                fontWeight: '700',
                borderRadius: '9999px',
                padding: '12px 32px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '15px'
              }}>
                {t('about.browse_btn')}
              </button>
            </Link>
            <Link href="/register">
              <button style={{
                background: '#004E64',
                color: 'white',
                fontWeight: '600',
                borderRadius: '9999px',
                padding: '12px 32px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '15px'
              }}>
                {t('about.seller_btn')}
              </button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
