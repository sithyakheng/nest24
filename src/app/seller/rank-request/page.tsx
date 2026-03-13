'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function RankRequestPage() {
  const supabase = createClient();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [shopName, setShopName] = useState('');
  const [selectedTier, setSelectedTier] = useState(3);
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const prices: Record<number, number> = { 1: 5, 2: 10, 3: 20 };
  const tierNames: Record<number, string> = { 1: 'Starter', 2: 'Verified', 3: 'Premium' };
  const basePrice = prices[selectedTier];
  const finalPrice = discountApplied ? (basePrice * 0.8).toFixed(2) : basePrice;

  const applyDiscount = () => {
    if (discountCode.toUpperCase() === 'SIMPLESHOP') {
      setDiscountApplied(true);
    } else {
      alert('Invalid discount code');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setScreenshot(file);
  };

  const handleSubmit = async () => {
    if (!fullName || !shopName || !screenshot) {
      alert('Please fill in all fields and upload payment proof');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', screenshot);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');
      const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      const screenshotUrl = data.secure_url;
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('rank_requests').insert({
        seller_id: user?.id,
        rank: selectedTier,
        status: 'pending',
        screenshot_url: screenshotUrl,
        full_name: fullName,
        shop_name: shopName,
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

        {/* ABA QR */}
        <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '24px', padding: '32px', textAlign: 'center', marginBottom: '36px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <p style={{ fontWeight: '700', fontSize: '17px', color: '#004E64', marginBottom: '20px' }}>📱 Scan to Pay via ABA</p>
          <img src="/aba-qr.png" alt="ABA QR Code" style={{ width: '280px', height: '280px', borderRadius: '16px', margin: '0 auto', display: 'block', border: '4px solid #f3f4f6' }} />
          <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '16px' }}>After payment, upload your screenshot below as proof</p>
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

          {/* Tier Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: '700', color: '#111827', marginBottom: '8px', fontSize: '14px' }}>Select Tier</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {[3, 2, 1].map(tier => (
                <div key={tier} onClick={() => setSelectedTier(tier)} style={{ border: selectedTier === tier ? '2px solid #004E64' : '2px solid #e5e7eb', borderRadius: '14px', padding: '14px 10px', textAlign: 'center', cursor: 'pointer', backgroundColor: selectedTier === tier ? '#f0f7fa' : 'white', transition: 'all 0.2s' }}>
                  <div style={{ fontWeight: '800', color: '#004E64', fontSize: '15px' }}>{tierNames[tier]}</div>
                  <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '2px' }}>${prices[tier]}/mo</div>
                </div>
              ))}
            </div>
          </div>

          {/* Discount Code */}
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

          {/* Price Summary */}
          <div style={{ backgroundColor: '#f0f7fa', borderRadius: '14px', padding: '16px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: '600', color: '#374151' }}>Total for {tierNames[selectedTier]}</span>
            <span style={{ fontWeight: '800', fontSize: '20px', color: '#004E64' }}>${finalPrice}/month</span>
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
