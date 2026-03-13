'use client';

import { useRouter } from 'next/navigation';

export default function RanksPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '40px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>🏆 Ranks</h1>
        <p style={{ color: '#6b7280', marginBottom: '40px' }}>Upgrade your seller tier to list more products and get verified.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
          {[
            { tier: 1, name: 'Starter', products: 30, price: '$5/month' },
            { tier: 2, name: 'Verified', products: 150, price: '$10/month' },
            { tier: 3, name: 'Premium', products: 300, price: '$20/month' },
          ].map((t) => (
            <div key={t.tier} style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '28px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#004E64', marginBottom: '8px' }}>TIER {t.tier}</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#111827', marginBottom: '4px' }}>{t.name}</div>
              <div style={{ color: '#6b7280', marginBottom: '16px' }}>Up to {t.products} products</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#004E64', marginBottom: '20px' }}>{t.price}</div>
              <button
                onClick={() => router.push('/seller/rank-request')}
                style={{ width: '100%', backgroundColor: '#004E64', color: 'white', border: 'none', borderRadius: '10px', padding: '12px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
              >
                Request This Tier
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
