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
            padding: '36px 28px',
            boxShadow: '0 20px 25px -5px rgba(0,78,100,0.15), 0 10px 10px -5px rgba(0,78,100,0.04)',
            position: 'relative',
            transform: 'scale(1.08)',
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
            
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#004E64', marginBottom: '12px' }}>TIER 3</div>
            <div style={{ fontSize: '36px', fontWeight: '900', color: '#111827', marginBottom: '8px' }}>Premium</div>
            <div style={{ color: '#6b7280', marginBottom: '24px', fontSize: '18px' }}>Maximum visibility & features</div>
            
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ color: '#10b981', fontSize: '20px', marginRight: '14px' }}>✓</span>
                <span style={{ color: '#374151', fontSize: '17px' }}>Up to 300 products</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ color: '#10b981', fontSize: '20px', marginRight: '14px' }}>✓</span>
                <span style={{ color: '#374151', fontSize: '17px' }}>Premium badge on profile</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ color: '#10b981', fontSize: '20px', marginRight: '14px' }}>✓</span>
                <span style={{ color: '#374151', fontSize: '17px' }}>Top search placement</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#10b981', fontSize: '20px', marginRight: '14px' }}>✓</span>
                <span style={{ color: '#374151', fontSize: '17px' }}>Priority support</span>
              </div>
            </div>
            
            <div style={{ fontSize: '40px', fontWeight: '900', color: '#004E64', marginBottom: '16px' }}>$30/month</div>
            
            <div style={{ marginBottom: '16px' }}>
              <button
                onClick={() => router.push('/seller/rank-request?tier=3&type=monthly')}
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
                  boxShadow: '0 4px 6px -1px rgba(0,78,100,0.3)',
                  marginBottom: '12px'
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
                Monthly
              </button>
              
              <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                <span style={{ color: '#6b7280', fontSize: '12px', fontWeight: '500' }}>One-time payment • Never expires</span>
              </div>
              
              <button
                onClick={() => router.push('/seller/rank-request?tier=3&type=forever')}
                style={{ 
                  width: '100%', 
                  backgroundColor: '#f59e0b', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '12px', 
                  padding: '16px 24px', 
                  fontWeight: '700', 
                  cursor: 'pointer', 
                  fontSize: '16px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 6px -1px rgba(245,158,11,0.3)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)'
                  e.currentTarget.style.boxShadow = '0 6px 8px -1px rgba(245,158,11,0.4)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(245,158,11,0.3)'
                }}
              >
                Forever • $119
              </button>
            </div>
          </div>

          {/* Verified Tier - Medium */}
          <div style={{ 
            backgroundColor: 'white', 
            borderLeft: '4px solid #004E64', 
            border: '1px solid #e5e7eb',
            borderRadius: '16px', 
            padding: '28px 24px',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#004E64', marginBottom: '10px' }}>TIER 2</div>
            <div style={{ fontSize: '30px', fontWeight: '800', color: '#111827', marginBottom: '6px' }}>Verified</div>
            <div style={{ color: '#6b7280', marginBottom: '20px', fontSize: '16px' }}>Build trust & credibility</div>
            
            <div style={{ marginBottom: '28px' }}>
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
            
            <div style={{ fontSize: '34px', fontWeight: '800', color: '#004E64', marginBottom: '16px' }}>$15/month</div>
            
            <div style={{ marginBottom: '16px' }}>
              <button
                onClick={() => router.push('/seller/rank-request?tier=2&type=monthly')}
                style={{ 
                  width: '100%', 
                  backgroundColor: '#004E64', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '12px', 
                  padding: '14px 24px', 
                  fontWeight: '700', 
                  cursor: 'pointer', 
                  fontSize: '15px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 6px -1px rgba(0,78,100,0.3)',
                  marginBottom: '12px'
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
                Monthly
              </button>
              
              <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                <span style={{ color: '#6b7280', fontSize: '12px', fontWeight: '500' }}>One-time payment • Never expires</span>
              </div>
              
              <button
                onClick={() => router.push('/seller/rank-request?tier=2&type=forever')}
                style={{ 
                  width: '100%', 
                  backgroundColor: '#f59e0b', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '12px', 
                  padding: '14px 24px', 
                  fontWeight: '700', 
                  cursor: 'pointer', 
                  fontSize: '15px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 6px -1px rgba(245,158,11,0.3)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)'
                  e.currentTarget.style.boxShadow = '0 6px 8px -1px rgba(245,158,11,0.4)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(245,158,11,0.3)'
                }}
              >
                Forever • $59
              </button>
            </div>
          </div>

          {/* Starter Tier - Smallest */}
          <div style={{ 
            backgroundColor: 'white', 
            border: '1px solid #d1d5db', 
            borderRadius: '16px', 
            padding: '20px 20px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>TIER 1</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Starter</div>
            <div style={{ color: '#6b7280', marginBottom: '20px', fontSize: '14px' }}>Perfect for getting started</div>
            
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ color: '#10b981', fontSize: '16px', marginRight: '10px' }}>✓</span>
                <span style={{ color: '#374151', fontSize: '13px' }}>Up to 30 products</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ color: '#10b981', fontSize: '16px', marginRight: '10px' }}>✓</span>
                <span style={{ color: '#374151', fontSize: '13px' }}>Starter badge on profile</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#10b981', fontSize: '16px', marginRight: '10px' }}>✓</span>
                <span style={{ color: '#374151', fontSize: '13px' }}>Basic listing</span>
              </div>
            </div>
            
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#6b7280', marginBottom: '16px' }}>$5/month</div>
            
            <div style={{ marginBottom: '16px' }}>
              <button
                onClick={() => router.push('/seller/rank-request?tier=1&type=monthly')}
                style={{ 
                  width: '100%', 
                  backgroundColor: '#6b7280', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '12px', 
                  padding: '12px 24px', 
                  fontWeight: '700', 
                  cursor: 'pointer', 
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.3)',
                  marginBottom: '12px'
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
                Monthly
              </button>
              
              <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                <span style={{ color: '#6b7280', fontSize: '12px', fontWeight: '500' }}>One-time payment • Never expires</span>
              </div>
              
              <button
                onClick={() => router.push('/seller/rank-request?tier=1&type=forever')}
                style={{ 
                  width: '100%', 
                  backgroundColor: '#f59e0b', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '12px', 
                  padding: '12px 24px', 
                  fontWeight: '700', 
                  cursor: 'pointer', 
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 6px -1px rgba(245,158,11,0.3)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)'
                  e.currentTarget.style.boxShadow = '0 6px 8px -1px rgba(245,158,11,0.4)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(245,158,11,0.3)'
                }}
              >
                Forever • $19
              </button>
            </div>
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
