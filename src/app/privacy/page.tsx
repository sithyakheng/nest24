'use client'

import Link from 'next/link'
import { useLang } from '@/contexts/LanguageContext'

export default function PrivacyPage() {
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
            Privacy Policy
          </span>
          <h1 style={{ color: 'white', fontSize: '42px', fontWeight: '900', margin: '0 0 16px 0' }}>
            Privacy Policy
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
            <h2 style={{ color: '#4DB8CC', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>Section 1: What We Collect</h2>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)' }}>
              We collect your name, email address, and phone number when you sign up. We also collect information about the products you list or browse.
            </p>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ color: '#4DB8CC', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>Section 2: How We Use It</h2>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)' }}>
              We use your data to run your account, display your listings, and improve NestKH. We do not sell your data to anyone.
            </p>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ color: '#4DB8CC', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>Section 3: Third Party Services</h2>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)' }}>
              NestKH uses Supabase for database and authentication, Cloudinary for image storage, and Vercel for hosting. These services may process your data as part of normal operations.
            </p>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ color: '#4DB8CC', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>Section 4: Cookies</h2>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)' }}>
              We use cookies to keep you logged in and to improve your experience on NestKH.
            </p>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ color: '#4DB8CC', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>Section 5: Your Rights</h2>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)' }}>
              You can request to delete your account and data at any time by contacting us.
            </p>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ color: '#4DB8CC', fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>Section 6: Contact</h2>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)' }}>
              For any privacy concerns, contact us through the NestKH platform.
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
