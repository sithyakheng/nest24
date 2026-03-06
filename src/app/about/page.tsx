'use client'

import Link from 'next/link'
import { useLang } from '@/contexts/LanguageContext'

export default function AboutPage() {
  const { t } = useLang()
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

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>

        {/* Hero */}
        <div style={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderTop: '1px solid rgba(255,255,255,0.22)',
          borderRadius: '24px',
          padding: '48px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <span style={{
            display: 'inline-block',
            background: 'rgba(0,78,100,0.3)',
            border: '1px solid rgba(0,78,100,0.5)',
            color: '#4DB8CC',
            fontSize: '12px',
            fontWeight: '600',
            padding: '6px 16px',
            borderRadius: '9999px',
            marginBottom: '24px',
            letterSpacing: '0.05em'
          }}>
            {t('about.badge')}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <img
              src="https://oisdppgqifhbtlanglwr.supabase.co/storage/v1/object/public/Product/nestkh-logo.png"
              alt="NestKH"
              style={{
                height: '60px',
                width: 'auto',
                objectFit: 'contain'
              }}
            />
            <h1 style={{ color: 'white', fontSize: '42px', fontWeight: '900', margin: 0 }}>
              {t('about.title')}
            </h1>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '17px', lineHeight: '1.7', fontWeight: '300', margin: 0 }}>
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
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '32px' }}>{item.emoji}</span>
              <p style={{ color: 'white', fontWeight: '700', fontSize: '16px', margin: '12px 0 4px 0' }}>{item.title}</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderTop: '1px solid rgba(255,255,255,0.22)',
          borderRadius: '24px',
          padding: '40px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: 'white', fontSize: '28px', fontWeight: '900', margin: '0 0 12px 0' }}>
            {t('about.ready')}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '24px' }}>
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
                background: 'rgba(255,255,255,0.08)',
                color: 'white',
                fontWeight: '600',
                borderRadius: '9999px',
                padding: '12px 32px',
                border: '1px solid rgba(255,255,255,0.15)',
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
