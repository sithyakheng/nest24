'use client';

import { useRouter } from 'next/navigation';

export default function RanksPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '0' }}>
      {/* Hero Section */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '80px 20px', 
        textAlign: 'center',
        borderBottom: '1px solid #e5e7eb',
        marginBottom: '60px'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: '900', 
            color: '#111827', 
            marginBottom: '16px',
            letterSpacing: '-0.02em'
          }}>🏆 NestKH Ranks</h1>
          <p style={{ 
            fontSize: '20px', 
            color: '#6b7280', 
            marginBottom: '0',
            fontWeight: '400'
          }}>Upgrade your seller tier to unlock more features and grow your business</p>
        </div>
      </div>

      {/* Tiers Section */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 60px' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '32px',
          alignItems: 'start'
        }}>
          
          {/* Premium Tier - Largest and Most Popular */}
          <div style={{ 
            backgroundColor: 'white', 
            border: '3px solid #004E64', 
            borderRadius: '20px', 
            padding: '40px 32px',
            boxShadow: '0 20px 25px -5px rgba(0,78,100,0.15), 0 10px 10px -5px rgba(0,78,100,0.04)',
            position: 'relative',
            transform: 'scale(1.05)',
            transition: 'transform 0.3s ease'
          }}>
            {/* Most Popular Badge */}
            <div style={{
              position: 'absolute',
              top: '-12px',
              right: '20px',
              backgroundColor: '#fbbf24',
              color: '#92400e',
              fontSize: '12px',
              fontWeight: '700',
              padding: '6px 16px',
              borderRadius: '20px',
              letterSpacing: '0.05em'
            }}>
              MOST POPULAR
            </div>
            
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#004E64', marginBottom: '12px' }}>TIER 3</div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: '#111827', marginBottom: '8px' }}>Premium</div>
            <div style={{ color: '#6b7280', marginBottom: '24px', fontSize: '16px' }}>Maximum visibility & features</div>
            
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ color: '#10b981', fontSize: '18px', marginRight: '12px' }}>✓</span>
                <span style={{ color: '#374151', fontSize: '15px' }}>Up to 300 products</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ color: '#10b981', fontSize: '18px', marginRight: '12px' }}>✓</span>
                <span style={{ color: '#374151', fontSize: '15px' }}>Premium badge on profile</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ color: '#10b981', fontSize: '18px', marginRight: '12px' }}>✓</span>
                <span style={{ color: '#374151', fontSize: '15px' }}>Top search placement</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#10b981', fontSize: '18px', marginRight: '12px' }}>✓</span>
                <span style={{ color: '#374151', fontSize: '15px' }}>Priority support</span>
              </div>
            </div>
            
            <div style={{ fontSize: '36px', fontWeight: '800', color: '#004E64', marginBottom: '24px' }}>$20/month</div>
            
            <button
              onClick={() => router.push('/seller/rank-request')}
              style={{ 
                width: '100%', 
                backgroundColor: '#004E64', 
                color: 'white', 
                border: 'none', 
                borderRadius: '12px', 
                padding: '16px 24px', 
                fontWeight: '700', 
                cursor: 'pointer', 
                fontSize: '16px',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 6px -1px rgba(0,78,100,0.3)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)'
                e.currentTarget.style.boxShadow = '0 6px 8px -1px rgba(0,78,100,0.4)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,78,100,0.3)'
              }}
            >
              Request This Tier
            </button>
          </div>

          {/* Verified Tier - Medium */}
          <div style={{ 
            backgroundColor: 'white', 
            borderLeft: '4px solid #004E64', 
            border: '1px solid #e5e7eb',
            borderRadius: '16px', 
            padding: '32px 28px',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#004E64', marginBottom: '12px' }}>TIER 2</div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>Verified</div>
            <div style={{ color: '#6b7280', marginBottom: '24px', fontSize: '16px' }}>Build trust & credibility</div>
            
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ color: '#10b981', fontSize: '18px', marginRight: '12px' }}>✓</span>
                <span style={{ color: '#374151', fontSize: '15px' }}>Up to 150 products</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ color: '#10b981', fontSize: '18px', marginRight: '12px' }}>✓</span>
                <span style={{ color: '#374151', fontSize: '15px' }}>Verified badge on profile</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#10b981', fontSize: '18px', marginRight: '12px' }}>✓</span>
                <span style={{ color: '#374151', fontSize: '15px' }}>Higher search ranking</span>
              </div>
            </div>
            
            <div style={{ fontSize: '32px', fontWeight: '800', color: '#004E64', marginBottom: '24px' }}>$10/month</div>
            
            <button
              onClick={() => router.push('/seller/rank-request')}
              style={{ 
                width: '100%', 
                backgroundColor: '#004E64', 
                color: 'white', 
                border: 'none', 
                borderRadius: '12px', 
                padding: '16px 24px', 
                fontWeight: '700', 
                cursor: 'pointer', 
                fontSize: '16px',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 6px -1px rgba(0,78,100,0.3)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)'
                e.currentTarget.style.boxShadow = '0 6px 8px -1px rgba(0,78,100,0.4)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,78,100,0.3)'
              }}
            >
              Request This Tier
            </button>
          </div>

          {/* Starter Tier - Standard */}
          <div style={{ 
            backgroundColor: 'white', 
            border: '1px solid #d1d5db', 
            borderRadius: '16px', 
            padding: '32px 28px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '12px' }}>TIER 1</div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>Starter</div>
            <div style={{ color: '#6b7280', marginBottom: '24px', fontSize: '16px' }}>Perfect for getting started</div>
            
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ color: '#10b981', fontSize: '18px', marginRight: '12px' }}>✓</span>
                <span style={{ color: '#374151', fontSize: '15px' }}>Up to 30 products</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ color: '#10b981', fontSize: '18px', marginRight: '12px' }}>✓</span>
                <span style={{ color: '#374151', fontSize: '15px' }}>Starter badge on profile</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#10b981', fontSize: '18px', marginRight: '12px' }}>✓</span>
                <span style={{ color: '#374151', fontSize: '15px' }}>Basic listing</span>
              </div>
            </div>
            
            <div style={{ fontSize: '32px', fontWeight: '800', color: '#6b7280', marginBottom: '24px' }}>$5/month</div>
            
            <button
              onClick={() => router.push('/seller/rank-request')}
              style={{ 
                width: '100%', 
                backgroundColor: '#6b7280', 
                color: 'white', 
                border: 'none', 
                borderRadius: '12px', 
                padding: '16px 24px', 
                fontWeight: '700', 
                cursor: 'pointer', 
                fontSize: '16px',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.3)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)'
                e.currentTarget.style.boxShadow = '0 6px 8px -1px rgba(0,0,0,0.4)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.3)'
              }}
            >
              Request This Tier
            </button>
          </div>
        </div>

        {/* Discount Note */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '60px', 
          padding: '24px', 
          backgroundColor: 'white', 
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          maxWidth: '600px',
          margin: '60px auto 0'
        }}>
          <p style={{ 
            fontSize: '16px', 
            color: '#374151', 
            margin: '0',
            fontWeight: '500'
          }}>
            🎁 Use code <span style={{ 
              backgroundColor: '#fef3c7', 
              color: '#92400e', 
              padding: '4px 8px', 
              borderRadius: '6px', 
              fontWeight: '700',
              fontFamily: 'monospace'
            }}>SIMPLESHOP</span> for 20% off your first upgrade
          </p>
        </div>
      </div>
    </div>
  );
}
