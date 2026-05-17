'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';

function RankRequestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tierParam = searchParams.get('tier');
  const typeParam = searchParams.get('type') || 'monthly';
  
  const [fullName, setFullName] = useState('');
  const [shopName, setShopName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedTier, setSelectedTier] = useState(3);
  const [planType, setPlanType] = useState<'monthly' | 'forever'>(typeParam === 'forever' ? 'forever' : 'monthly');
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => { if (tierParam) setSelectedTier(parseInt(tierParam)); }, [tierParam]);

  const monthlyPrices: Record<number, number> = { 1: 5, 2: 15, 3: 30 };
  const foreverPrices: Record<number, number> = { 1: 19, 2: 59, 3: 119 };
  const tierNames: Record<number, string> = { 1: 'Starter', 2: 'Verified', 3: 'Premium' };
  const monthlyQR: Record<number, string> = {
    1: 'https://res.cloudinary.com/dis7tyccn/image/upload/v1779000341/37f4432c-6938-41b8-b87b-5eba9b362f5d_rwiilm.jpg',
    2: 'https://res.cloudinary.com/dis7tyccn/image/upload/v1779000335/8182a258-f74c-4b6a-b4c1-e3b97014c28c_ttqpdb.jpg',
    3: 'https://res.cloudinary.com/dis7tyccn/image/upload/v1779000310/57f452da-c0ec-42ce-82a0-94971fb12d98_dljqjk.jpg',
  };
  const foreverQR: Record<number, string> = {
    1: 'https://res.cloudinary.com/dis7tyccn/image/upload/v1779000643/16780093-5d3b-4ac8-80b7-ca60b2f16265_v0vyr4.jpg',
    2: 'https://res.cloudinary.com/dis7tyccn/image/upload/v1779000692/6b10b7d3-0556-4b79-8e78-4bf145bc6314_yz4fbq.jpg',
    3: 'https://res.cloudinary.com/dis7tyccn/image/upload/v1779000627/c4394336-d291-4abf-a15d-3bc679f6ce70_c1oi24.jpg',
  };

  const isForever = planType === 'forever';
  const prices = isForever ? foreverPrices : monthlyPrices;
  const basePrice = prices[selectedTier];
  const finalPrice = !isForever && discountApplied ? (basePrice * 0.8).toFixed(2) : basePrice;
  const currentQR = isForever ? foreverQR[selectedTier] : monthlyQR[selectedTier];

  const applyDiscount = async () => {
    try {
      const res = await fetch('/api/validate-discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode }),
      });
      const data = await res.json();
      if (data.valid) {
        setDiscountApplied(true);
      } else {
        alert('Invalid discount code');
      }
    } catch {
      alert('Could not validate discount code. Please try again.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setScreenshot(file);
  };

  const handleSubmit = async () => {
    if (!fullName || !shopName || !phoneNumber || !screenshot) {
      alert('Please fill in all fields including phone number and upload payment proof');
      return;
    }
    setLoading(true);
    try {
      // Upload via secure /api/upload (auth-gated + validated)
      const formData = new FormData();
      formData.append('file', screenshot);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!data.url) {
        alert('Image upload failed: ' + (data.error || 'Unknown error'));
        setLoading(false);
        return;
      }
      const screenshotUrl = data.url;
      const { data: { user } } = await supabase.auth.getUser();
      const planType = isForever ? 'forever' : 'monthly';
      await supabase.from('rank_requests').insert({
        seller_id: user?.id,
        rank: selectedTier,
        status: 'pending',
        screenshot_url: screenshotUrl,
        full_name: fullName,
        shop_name: shopName,
        phone_number: phoneNumber,
        plan_type: planType,
      });
      setSuccess(true);
    } catch {
      alert('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  if (success) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '56px 48px', textAlign: 'center', maxWidth: '440px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize: '56px', marginBottom: '20px' }}>✅</div>
        <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#111827', marginBottom: '10px' }}>Request Submitted!</h2>
        <p style={{ color: '#6b7280', marginBottom: '28px', lineHeight: '1.5' }}>We'll review your payment and upgrade your tier within 24 hours.</p>
        <button onClick={() => router.push('/')} style={{ backgroundColor: '#004E64', color: 'white', border: 'none', borderRadius: '14px', padding: '14px 32px', fontWeight: '700', cursor: 'pointer', fontSize: '15px' }}>
          Back to Home
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '48px 20px' }}>
      <div style={{ maxWidth: '620px', margin: '0 auto' }}>

        <h1 style={{ fontSize: '30px', fontWeight: '800', color: '#111827', marginBottom: '6px', textAlign: 'center' }}>🏆 Request Rank Upgrade</h1>
        <p style={{ color: '#6b7280', marginBottom: '36px', textAlign: 'center', fontSize: '16px' }}>Complete the form below to upgrade your seller tier</p>

        {/* Plan Type Toggle */}
        <div style={{ display: 'flex', background: '#e5e7eb', borderRadius: '14px', padding: '4px', marginBottom: '28px' }}>
          <button
            onClick={() => { setPlanType('monthly'); setDiscountApplied(false); setDiscountCode(''); }}
            style={{ flex: 1, padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '14px', transition: 'all 0.2s',
              background: planType === 'monthly' ? 'white' : 'transparent',
              color: planType === 'monthly' ? '#004E64' : '#6b7280',
              boxShadow: planType === 'monthly' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none' }}
          >📅 Monthly</button>
          <button
            onClick={() => { setPlanType('forever'); setDiscountApplied(false); setDiscountCode(''); }}
            style={{ flex: 1, padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '14px', transition: 'all 0.2s',
              background: planType === 'forever' ? '#004E64' : 'transparent',
              color: planType === 'forever' ? 'white' : '#6b7280',
              boxShadow: planType === 'forever' ? '0 2px 8px rgba(0,78,100,0.3)' : 'none' }}
          >♾️ Lifetime</button>
        </div>

        {/* Aceleda QR — changes based on tier AND plan type */}
        <div style={{ backgroundColor: 'white', border: isForever ? '2px solid #004E64' : '1px solid #e5e7eb', borderRadius: '24px', padding: '32px', textAlign: 'center', marginBottom: '36px', boxShadow: isForever ? '0 4px 24px rgba(0,78,100,0.15)' : '0 2px 12px rgba(0,0,0,0.06)' }}>
          {isForever && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #004E64, #006d8a)', color: 'white', borderRadius: '9999px', padding: '5px 14px', fontSize: '12px', fontWeight: '700', marginBottom: '12px', letterSpacing: '0.03em' }}>
              ♾️ LIFETIME — Never Expires
            </div>
          )}
          <p style={{ fontWeight: '700', fontSize: '17px', color: '#004E64', marginBottom: '4px' }}>📱 Scan to Pay via Aceleda</p>
          <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '20px' }}>
            {tierNames[selectedTier]} Plan — {isForever ? `$${foreverPrices[selectedTier]} one-time payment` : `$${monthlyPrices[selectedTier]}/month`}
          </p>
          <img
            key={currentQR}
            src={currentQR}
            alt={`Aceleda QR — ${tierNames[selectedTier]} ${isForever ? `$${foreverPrices[selectedTier]} lifetime` : `$${monthlyPrices[selectedTier]}/month`}`}
            style={{ width: '260px', height: '260px', borderRadius: '16px', margin: '0 auto', display: 'block', border: '4px solid #f3f4f6', objectFit: 'contain' }}
          />
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '16px', background: isForever ? 'rgba(0,78,100,0.07)' : '#f0fdf4', border: isForever ? '1px solid rgba(0,78,100,0.25)' : '1px solid #bbf7d0', borderRadius: '9999px', padding: '6px 16px' }}>
            <span style={{ color: isForever ? '#004E64' : '#16a34a', fontWeight: '800', fontSize: '18px' }}>${isForever ? foreverPrices[selectedTier] : monthlyPrices[selectedTier]}</span>
            <span style={{ color: '#6b7280', fontSize: '13px' }}>USD — {tierNames[selectedTier]} {isForever ? '(one-time)' : '/month'}</span>
          </div>
          <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '12px' }}>After payment, upload your screenshot below as proof</p>
        </div>

        {/* Form Card */}
        <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '24px', padding: '32px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>

          {/* Full Name */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: '700', color: '#111827', marginBottom: '8px', fontSize: '14px' }}>Full Name</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter your full name" style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '13px 16px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#111827' }} />
          </div>

          {/* Shop Name */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: '700', color: '#111827', marginBottom: '8px', fontSize: '14px' }}>Shop Name</label>
            <input value={shopName} onChange={e => setShopName(e.target.value)} placeholder="Enter your shop name" style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '13px 16px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#111827' }} />
          </div>

          {/* Phone Number */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: '700', color: '#111827', marginBottom: '8px', fontSize: '14px' }}>Phone Number</label>
            <input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="Your phone number" style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '13px 16px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#111827' }} />
          </div>

          {/* Lifetime Badge */}
          {isForever && (
            <div style={{ 
              backgroundColor: '#dcfce7', 
              border: '1px solid #bbf7d0', 
              borderRadius: '12px', 
              padding: '12px 16px', 
              textAlign: 'center', 
              marginBottom: '24px' 
            }}>
              <span style={{ 
                color: '#16a34a', 
                fontSize: '14px', 
                fontWeight: '700' 
              }}>♾️ Lifetime Access — Never Expires</span>
            </div>
          )}

          {/* Tier Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: '700', color: '#111827', marginBottom: '8px', fontSize: '14px' }}>Select Tier</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {[3, 2, 1].map(tier => (
                <div key={tier} onClick={() => setSelectedTier(tier)} style={{ border: selectedTier === tier ? '2px solid #004E64' : '2px solid #e5e7eb', borderRadius: '14px', padding: '14px 10px', textAlign: 'center', cursor: 'pointer', backgroundColor: selectedTier === tier ? '#f0f7fa' : 'white', transition: 'all 0.2s' }}>
                  <div style={{ fontWeight: '800', color: '#004E64', fontSize: '15px' }}>{tierNames[tier]}</div>
                  <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '2px' }}>${prices[tier]}{isForever ? ' (once)' : '/mo'}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Discount Code - Only for Monthly Plans */}
          {!isForever && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '700', color: '#111827', marginBottom: '8px', fontSize: '14px' }}>Discount Code</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input value={discountCode} onChange={e => setDiscountCode(e.target.value)} placeholder="Enter code (e.g. SIMPLESHOP)" disabled={discountApplied} style={{ flex: 1, border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '13px 16px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#111827' }} />
                <button onClick={applyDiscount} disabled={discountApplied} style={{ backgroundColor: discountApplied ? '#6b7280' : '#004E64', color: 'white', border: 'none', borderRadius: '12px', padding: '13px 20px', fontWeight: '700', cursor: discountApplied ? 'default' : 'pointer', fontSize: '14px', whiteSpace: 'nowrap' }}>
                  {discountApplied ? '✓ Applied' : 'Apply'}
                </button>
              </div>
              {discountApplied && <p style={{ color: '#16a34a', fontSize: '13px', marginTop: '6px', fontWeight: '600' }}>🎉 20% discount applied!</p>}
            </div>
          )}

          {/* Price Summary */}
          <div style={{ backgroundColor: '#f0f7fa', borderRadius: '14px', padding: '16px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: '600', color: '#374151' }}>Total for {tierNames[selectedTier]}</span>
            <span style={{ fontWeight: '800', fontSize: '20px', color: '#004E64' }}>${finalPrice}{isForever ? ' (once)' : '/month'}</span>
          </div>

          {/* File Drop Zone */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: '700', color: '#111827', marginBottom: '8px', fontSize: '14px' }}>Payment Proof Screenshot</label>
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('fileInput')?.click()}
              style={{ border: `2px dashed ${dragging ? '#004E64' : '#d1d5db'}`, borderRadius: '16px', padding: '48px 20px', textAlign: 'center', cursor: 'pointer', backgroundColor: dragging ? '#f0f7fa' : '#fafafa', transition: 'all 0.2s' }}
            >
              {screenshot ? (
                <div>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📎</div>
                  <p style={{ fontWeight: '700', color: '#111827', fontSize: '14px' }}>{screenshot.name}</p>
                  <p style={{ color: '#9ca3af', fontSize: '12px', marginTop: '4px' }}>Click to change file</p>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>📤</div>
                  <p style={{ fontWeight: '700', color: '#111827', fontSize: '15px', marginBottom: '6px' }}>Drop your screenshot here</p>
                  <p style={{ color: '#9ca3af', fontSize: '12px' }}>or click to browse files</p>
                </div>
              )}
            </div>
            <input id="fileInput" type="file" accept="image/*" onChange={e => setScreenshot(e.target.files?.[0] || null)} style={{ display: 'none' }} />
          </div>

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', backgroundColor: loading ? '#6b7280' : '#004E64', color: 'white', border: 'none', borderRadius: '14px', padding: '16px', fontWeight: '800', cursor: loading ? 'default' : 'pointer', fontSize: '16px', letterSpacing: '0.02em' }}>
            {loading ? 'Submitting...' : '🚀 Submit Rank Request'}
          </button>

        </div>

        <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '13px', marginTop: '20px' }}>
          🎁 Use code <strong style={{ color: '#004E64' }}>SIMPLESHOP</strong> for 20% off
        </p>

      </div>
    </div>
  );
}

export default function RankRequestPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p>Loading...</p></div>}>
      <RankRequestContent />
    </Suspense>
  );
}
