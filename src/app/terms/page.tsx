'use client'

import Link from 'next/link'
import { useLang } from '@/contexts/LanguageContext'

export default function TermsPage() {
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

        {/* Header */}
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
            Legal Agreement
          </span>
          <h1 style={{ color: 'white', fontSize: '42px', fontWeight: '900', margin: '0 0 16px 0' }}>
            Terms & Conditions
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '17px', lineHeight: '1.7', fontWeight: '300', margin: 0 }}>
            Last updated: March 2026
          </p>
        </div>

        {/* Content */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '24px',
          padding: '40px',
          color: 'rgba(255,255,255,0.9)',
          fontSize: '15px',
          lineHeight: '1.8'
        }}>
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ color: '#4DB8CC', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>Section 1: About NestKH</h2>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)' }}>
              NestKH is a Cambodian online marketplace that connects buyers and sellers. We provide the platform only — we are not a party to any transaction between buyers and sellers.
            </p>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ color: '#4DB8CC', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>Section 2: Your Account</h2>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)' }}>
              You are responsible for keeping your account secure. You must provide accurate information when signing up. We reserve the right to suspend or ban accounts that violate these terms.
            </p>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ color: '#4DB8CC', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>Section 3: Sellers</h2>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)' }}>
              Sellers are responsible for the accuracy of their listings. Product limits apply based on your tier (Free: 5, Tier 1: 30, Tier 2: 150, Tier 3: 300). We reserve the right to remove any listing that violates our rules.
            </p>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ color: '#4DB8CC', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>Section 4: Buyers</h2>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)' }}>
              All transactions happen directly between buyers and sellers. NestKH is not responsible for the quality, safety, or delivery of any product. Contact the seller directly for any issues.
            </p>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ color: '#4DB8CC', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>Section 5: No Refunds</h2>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)' }}>
              NestKH does not process payments and therefore does not offer refunds. All sales are final and handled directly between the buyer and seller. Any refund requests must be resolved between the two parties privately.
            </p>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ color: '#4DB8CC', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>Section 6: No Scamming or Fraud</h2>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)' }}>
              Any user found scamming, deceiving, or defrauding other users will be permanently banned from NestKH without warning. This includes fake listings, false product descriptions, taking payment without delivering goods, and any other form of dishonest behavior. We take fraud seriously and will report severe cases to the relevant authorities.
            </p>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ color: '#4DB8CC', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>Section 7: Prohibited Content</h2>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)' }}>
              You may not list illegal, counterfeit, or harmful products. Spam, fraud, or abuse of any kind will result in immediate account removal.
            </p>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ color: '#4DB8CC', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>Section 8: Changes</h2>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)' }}>
              We may update these terms at any time. Continued use of NestKH means you accept the updated terms.
            </p>
          </div>
        </div>

        {/* Back button */}
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <Link href="/">
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
              Back to Home
            </button>
          </Link>
        </div>

      </div>
    </div>
  )
}
