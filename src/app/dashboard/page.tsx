'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  // Add Product form state
  const [productName, setProductName] = useState('')
  const [productDesc, setProductDesc] = useState('')
  const [productPrice, setProductPrice] = useState('')
  const [productCategory, setProductCategory] = useState('Electronics')
  const [productStock, setProductStock] = useState('')
  const [productDiscount, setProductDiscount] = useState('')
  const [productImage, setProductImage] = useState<File | null>(null)
  const [productImagePreview, setProductImagePreview] = useState<string | null>(null)
  const [addingProduct, setAddingProduct] = useState(false)
  const [addError, setAddError] = useState('')
  const [addSuccess, setAddSuccess] = useState(false)

  // Profile form state
  const [fullName, setFullName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [facebook, setFacebook] = useState('')
  const [instagram, setInstagram] = useState('')
  const [telegram, setTelegram] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)

  const CATEGORIES = ['Electronics', 'Fashion', 'Home Living', 'Beauty', 'Food', 'Gaming', 'Other']

  useEffect(() => {
  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    await loadProfile(user)
    setUser(user)
    setLoading(false)
  }
  load()
}, [])

async function loadProfile(currentUser: any) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', currentUser.id)
    .single()

  if (profile?.role !== 'seller') { router.push('/'); return }

  setProfile(profile)
  setFullName(profile?.full_name || '')
  setDisplayName(profile?.name || '')
  setBio(profile?.bio || '')
  setPhone(profile?.phone || '')
  setWhatsapp(profile?.whatsapp || '')
  setFacebook(profile?.facebook || '')
  setInstagram(profile?.instagram || '')
  setTelegram(profile?.telegram || '')

  const { data: productsData } = await supabase
    .from('products')
    .select('*')
    .eq('seller_id', currentUser.id)
    .order('created_at', { ascending: false })
  setProducts(productsData || [])

  const { data: ordersData } = await supabase
    .from('orders')
    .select('*, products(name)')
    .eq('seller_id', currentUser.id)
    .order('created_at', { ascending: false })
  setOrders(ordersData || [])
}

useEffect(() => {
  let sub: any = null
  
  async function setup() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    sub = supabase
      .channel('profile-rank-update')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${user.id}` 
      }, (payload) => {
        console.log('Profile updated:', payload.new)
        setProfile(payload.new)
      })
      .subscribe()
  }
  
  setup()
  return () => { if (sub) supabase.removeChannel(sub) }
}, [])

  async function handleAddProduct() {
    console.log('Starting add product...')
    console.log('productName:', productName)
    console.log('productPrice:', productPrice)
    console.log('productStock:', productStock)
    console.log('user:', user?.id)

    if (!productName || !productPrice || !productStock) {
      setAddError('Please fill in name, price and stock.')
      return
    }
    setAddingProduct(true)
    setAddError('')

    let imageUrl = ''

    if (productImage) {
      console.log('Uploading image...')
      const fileExt = productImage.name.split('.').pop()
      const fileName = `product-${user.id}-${Date.now()}.${fileExt}` 
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('Product')
        .upload(fileName, productImage)
      
      console.log('Upload result:', uploadData, uploadError)
      
      if (uploadError) {
        setAddError('Image upload failed: ' + uploadError.message)
        setAddingProduct(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('Product')
        .getPublicUrl(fileName)
      imageUrl = urlData.publicUrl
      console.log('Image URL:', imageUrl)
    }

    const insertData = {
      seller_id: user.id,
      name: productName,
      description: productDesc,
      price: parseFloat(productPrice),
      stock: parseInt(productStock),
      category: productCategory,
      discount: productDiscount ? parseFloat(productDiscount) : 0,
      image_url: imageUrl
    }
    
    console.log('Inserting product:', insertData)

    const { data, error } = await supabase
      .from('products')
      .insert(insertData)
      .select()

    console.log('Insert result:', data, error)

    if (error) {
      setAddError('Failed to add product: ' + error.message)
      setAddingProduct(false)
      return
    }

    setAddSuccess(true)
    // reset form
    setProductName('')
    setProductDesc('')
    setProductPrice('')
    setProductStock('')
    setProductDiscount('')
    setProductImage(null)
    setProductImagePreview(null)
    setAddingProduct(false)

    // Refresh products list
    const { data: productsData } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })
    setProducts(productsData || [])

    setTimeout(() => setAddSuccess(false), 3000)
  }

  async function handleDeleteProduct(productId: string) {
    if (!confirm('Delete this product?')) return
    await supabase.from('products').delete().eq('id', productId)
    setProducts(products.filter(p => p.id !== productId))
  }

  async function handleSaveProfile() {
    setSavingProfile(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        name: displayName,
        bio,
        phone,
        whatsapp,
        facebook,
        instagram,
        telegram,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
    
    setSavingProfile(false)
    if (!error) {
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#080a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '16px' }}>
      Loading Dashboard...
    </div>
  )

  const glassCard = {
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderTop: '1px solid rgba(255,255,255,0.22)',
    borderRadius: '20px',
  }

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '12px',
    color: 'white',
    padding: '12px 16px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box' as const
  }

  const navItems = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'products', label: '📦 My Products' },
    { id: 'add', label: '➕ Add Product' },
    { id: 'orders', label: '🛒 Orders' },
    { id: 'profile', label: '👤 Profile Settings' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#080a0f', paddingTop: '40px', paddingBottom: '60px', position: 'relative' }}>

      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-150px', left: '-100px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,78,100,0.4) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '-150px', right: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,201,126,0.25) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10, display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px', alignItems: 'start' }}>

        {/* SIDEBAR */}
        <div style={{ ...glassCard, padding: '24px', position: 'sticky', top: '24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(0,78,100,0.4)', border: '2px solid rgba(0,78,100,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4DB8CC', fontWeight: '900', fontSize: '24px', margin: '0 auto 12px auto' }}>
              {(profile?.name || profile?.full_name || 'S').charAt(0).toUpperCase()}
            </div>
            <p style={{ color: 'white', fontWeight: '700', fontSize: '15px', margin: '0 0 4px 0' }}>{profile?.name || profile?.full_name || 'Seller'}</p>
            <span style={{ background: 'rgba(0,78,100,0.3)', border: '1px solid rgba(0,78,100,0.5)', color: '#4DB8CC', fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '9999px' }}>Seller</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Link href="/">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '12px', color: 'rgba(255,255,255,0.5)', fontSize: '14px', cursor: 'pointer', marginBottom: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                ← Back to Store
              </div>
            </Link>

            {navItems.map(item => (
              <div
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 14px', borderRadius: '12px',
                  color: activeTab === item.id ? '#4DB8CC' : 'rgba(255,255,255,0.6)',
                  fontSize: '14px', fontWeight: activeTab === item.id ? '600' : '400',
                  cursor: 'pointer',
                  background: activeTab === item.id ? 'rgba(0,78,100,0.2)' : 'transparent',
                  border: activeTab === item.id ? '1px solid rgba(0,78,100,0.3)' : '1px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                {item.label}
              </div>
            ))}

            <Link href="/dashboard/ranks">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '12px', color: '#E8C97E', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginTop: '8px', background: 'rgba(232,201,126,0.08)', border: '1px solid rgba(232,201,126,0.15)' }}>
                🏆 Get Ranked
              </div>
            </Link>

            <div
              onClick={async () => { await supabase.auth.signOut(); router.push('/') }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '12px', color: 'rgba(255,80,80,0.7)', fontSize: '14px', cursor: 'pointer', marginTop: '4px', transition: 'all 0.2s' }}
            >
              🚪 Sign Out
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div>

          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>DASHBOARD</p>
              <h1 style={{ color: 'white', fontSize: '32px', fontWeight: '900', margin: '0 0 24px 0' }}>
                Welcome, {profile?.name || profile?.full_name || 'Seller'} 👋
              </h1>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {[
                  { label: 'Total Products', value: products.length, color: '#4DB8CC' },
                  { label: 'Total Orders', value: orders.length, color: '#E8C97E' },
                  { label: 'Pending Orders', value: orders.filter(o => o.status === 'pending').length, color: '#f87171' },
                  { label: 'Current Rank', value: profile?.rank && profile.rank !== 'none' ? profile.rank.charAt(0).toUpperCase() + profile.rank.slice(1) : 'None', color: '#a78bfa' },
                ].map((stat, i) => (
                  <div key={i} style={{ ...glassCard, padding: '20px' }}>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px 0' }}>{stat.label}</p>
                    <p style={{ color: stat.color, fontSize: '32px', fontWeight: '900', margin: 0 }}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Rank Status */}
              <div style={{
                background: profile?.rank && profile.rank !== 'none'
                  ? profile.rank === 'premium' 
                    ? 'rgba(232,201,126,0.08)' 
                    : profile.rank === 'verified'
                    ? 'rgba(0,78,100,0.08)'
                    : 'rgba(59,130,246,0.08)'
                  : 'rgba(255,255,255,0.04)',
                border: `1px solid ${profile?.rank && profile.rank !== 'none'
                  ? profile.rank === 'premium'
                    ? 'rgba(232,201,126,0.25)'
                    : profile.rank === 'verified'
                    ? 'rgba(0,78,100,0.3)'
                    : 'rgba(59,130,246,0.25)'
                  : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '16px',
                padding: '20px 24px',
                marginTop: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontSize: '32px' }}>
                    {profile?.rank === 'premium' ? '⭐' : profile?.rank === 'verified' ? '✓' : profile?.rank === 'starter' ? '🥉' : '🏅'}
                  </span>
                  <div>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px 0' }}>
                      Your Rank
                    </p>
                    <p style={{ 
                      fontWeight: '900', fontSize: '20px', margin: 0,
                      color: profile?.rank === 'premium' ? '#E8C97E' : profile?.rank === 'verified' ? '#4DB8CC' : profile?.rank === 'starter' ? '#93c5fd' : 'rgba(255,255,255,0.4)'
                    }}>
                      {profile?.rank && profile.rank !== 'none' 
                        ? profile.rank.charAt(0).toUpperCase() + profile.rank.slice(1) 
                        : 'No Rank Yet'}
                    </p>
                    {profile?.rank && profile.rank !== 'none' && (
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '4px 0 0 0' }}>
                        Your products have a {profile.rank} badge visible to all buyers
                      </p>
                    )}
                  </div>
                </div>
                <Link href="/dashboard/ranks">
                  <button style={{
                    background: profile?.rank && profile.rank !== 'none' 
                      ? 'rgba(255,255,255,0.06)' 
                      : 'linear-gradient(135deg, #E8C97E, #F0B429)',
                    color: profile?.rank && profile.rank !== 'none' ? 'rgba(255,255,255,0.6)' : 'black',
                    fontWeight: '700',
                    borderRadius: '9999px',
                    padding: '10px 22px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}>
                    {profile?.rank && profile.rank !== 'none' ? 'Upgrade Rank' : '🏆 Get Ranked'}
                  </button>
                </Link>
              </div>
            </div>
          )}

          {/* MY PRODUCTS */}
          {activeTab === 'products' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{ color: 'white', fontSize: '28px', fontWeight: '900', margin: 0 }}>My Products</h2>
                <button onClick={() => setActiveTab('add')} style={{ background: 'linear-gradient(135deg, #E8C97E, #F0B429)', color: 'black', fontWeight: '700', borderRadius: '9999px', padding: '10px 24px', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
                  + Add Product
                </button>
              </div>
              {products.length === 0 ? (
                <div style={{ ...glassCard, padding: '48px', textAlign: 'center' }}>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '16px', marginBottom: '16px' }}>No products yet</p>
                  <button onClick={() => setActiveTab('add')} style={{ background: 'linear-gradient(135deg, #E8C97E, #F0B429)', color: 'black', fontWeight: '700', borderRadius: '9999px', padding: '12px 28px', border: 'none', cursor: 'pointer' }}>
                    Add Your First Product
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {products.map(product => (
                    <div key={product.id} style={{ ...glassCard, padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '60px', height: '60px', borderRadius: '12px', overflow: 'hidden', background: 'rgba(255,255,255,0.06)', flexShrink: 0 }}>
                        {product.image_url && <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: 'white', fontWeight: '600', margin: '0 0 4px 0' }}>{product.name}</p>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: 0 }}>{product.category} · ${product.price} · Stock: {product.stock}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Link href={`/products/${product.id}`}>
                          <button style={{ background: 'rgba(0,78,100,0.3)', border: '1px solid rgba(0,78,100,0.5)', color: '#4DB8CC', borderRadius: '9999px', padding: '8px 16px', cursor: 'pointer', fontSize: '13px' }}>
                            View
                          </button>
                        </Link>
                        <button onClick={() => handleDeleteProduct(product.id)} style={{ background: 'rgba(255,80,80,0.15)', border: '1px solid rgba(255,80,80,0.3)', color: '#f87171', borderRadius: '9999px', padding: '8px 16px', cursor: 'pointer', fontSize: '13px' }}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ADD PRODUCT */}
          {activeTab === 'add' && (
            <div>
              <h2 style={{ color: 'white', fontSize: '28px', fontWeight: '900', margin: '0 0 24px 0' }}>Add New Product</h2>
              <div style={{ ...glassCard, padding: '32px', maxWidth: '600px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                  <div>
                    <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>Product Name</label>
                    <input type="text" value={productName} onChange={e => setProductName(e.target.value)} placeholder="Enter product name" style={inputStyle} />
                  </div>

                  <div>
                    <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>Description</label>
                    <textarea value={productDesc} onChange={e => setProductDesc(e.target.value)} placeholder="Describe your product" rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>Price ($)</label>
                      <input type="number" value={productPrice} onChange={e => setProductPrice(e.target.value)} placeholder="0.00" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>Stock</label>
                      <input type="number" value={productStock} onChange={e => setProductStock(e.target.value)} placeholder="0" style={inputStyle} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>Category</label>
                      <select value={productCategory} onChange={e => setProductCategory(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                        {CATEGORIES.map(cat => <option key={cat} value={cat} style={{ background: '#0d0e12' }}>{cat}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>Discount (%)</label>
                      <input type="number" value={productDiscount} onChange={e => setProductDiscount(e.target.value)} placeholder="0" style={inputStyle} />
                    </div>
                  </div>

                  <div>
                    <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>Product Image</label>
                    <div onClick={() => document.getElementById('product-image-upload')?.click()} style={{ background: 'rgba(255,255,255,0.04)', border: productImagePreview ? '1px solid rgba(0,78,100,0.5)' : '2px dashed rgba(255,255,255,0.15)', borderRadius: '16px', padding: '24px', textAlign: 'center', cursor: 'pointer', overflow: 'hidden' }}>
                      {productImagePreview ? (
                        <img src={productImagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', objectFit: 'contain' }} />
                      ) : (
                        <div>
                          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: '0 0 4px 0' }}>📸 Upload Product Image</p>
                          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px', margin: 0 }}>Click to browse</p>
                        </div>
                      )}
                    </div>
                    <input id="product-image-upload" type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setProductImage(f); setProductImagePreview(URL.createObjectURL(f)) } }} style={{ display: 'none' }} />
                  </div>

                  {addError && (
                    <div style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.2)', borderRadius: '12px', padding: '12px 16px', color: '#f87171', fontSize: '14px' }}>
                      {addError}
                    </div>
                  )}

                  {addSuccess && (
                    <div style={{ background: 'rgba(0,200,100,0.1)', border: '1px solid rgba(0,200,100,0.3)', borderRadius: '12px', padding: '12px 16px', color: '#4ade80', fontSize: '14px', fontWeight: '600' }}>
                      ✅ Product added successfully!
                    </div>
                  )}

                  <button onClick={handleAddProduct} disabled={addingProduct} style={{ background: addingProduct ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #E8C97E, #F0B429)', color: addingProduct ? 'rgba(255,255,255,0.4)' : 'black', fontWeight: '900', fontSize: '15px', borderRadius: '9999px', padding: '14px', border: 'none', cursor: addingProduct ? 'not-allowed' : 'pointer', width: '100%' }}>
                    {addingProduct ? 'Adding Product...' : 'Add Product ✓'}
                  </button>

                </div>
              </div>
            </div>
          )}

          {/* ORDERS */}
          {activeTab === 'orders' && (
            <div>
              <h2 style={{ color: 'white', fontSize: '28px', fontWeight: '900', margin: '0 0 24px 0' }}>Orders</h2>
              {orders.length === 0 ? (
                <div style={{ ...glassCard, padding: '48px', textAlign: 'center' }}>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '16px' }}>No orders yet</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {orders.map(order => (
                    <div key={order.id} style={{ ...glassCard, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontFamily: 'monospace', margin: 0 }}>#{order.id.slice(0,8)}</p>
                      <p style={{ color: 'white', fontWeight: '600', margin: 0 }}>{order.products?.name}</p>
                      <p style={{ color: '#E8C97E', fontWeight: '700', margin: 0 }}>${order.total_price}</p>
                      <span style={{ padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600', background: order.status === 'completed' ? 'rgba(0,200,100,0.15)' : order.status === 'cancelled' ? 'rgba(255,80,80,0.15)' : 'rgba(232,201,126,0.15)', color: order.status === 'completed' ? '#4ade80' : order.status === 'cancelled' ? '#f87171' : '#E8C97E' }}>
                        {order.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PROFILE SETTINGS */}
          {activeTab === 'profile' && (
            <div>
              <h2 style={{ color: 'white', fontSize: '28px', fontWeight: '900', margin: '0 0 24px 0' }}>Profile Settings</h2>
              <div style={{ ...glassCard, padding: '32px', maxWidth: '600px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                  {[
                    { label: 'Full Name', value: fullName, setter: setFullName, placeholder: 'Your full name' },
                    { label: 'Display Name', value: displayName, setter: setDisplayName, placeholder: 'Your shop/display name' },
                    { label: 'Bio', value: bio, setter: setBio, placeholder: 'Tell buyers about yourself', textarea: true },
                    { label: 'Phone', value: phone, setter: setPhone, placeholder: '+855 xx xxx xxxx' },
                    { label: 'WhatsApp', value: whatsapp, setter: setWhatsapp, placeholder: '+855 xx xxx xxxx' },
                    { label: 'Facebook', value: facebook, setter: setFacebook, placeholder: 'facebook.com/yourpage' },
                    { label: 'Instagram', value: instagram, setter: setInstagram, placeholder: '@yourhandle' },
                    { label: 'Telegram', value: telegram, setter: setTelegram, placeholder: '@yourhandle' },
                  ].map((field: any) => (
                    <div key={field.label}>
                      <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>{field.label}</label>
                      {field.textarea ? (
                        <textarea value={field.value} onChange={(e: any) => field.setter(e.target.value)} placeholder={field.placeholder} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                      ) : (
                        <input type="text" value={field.value} onChange={(e: any) => field.setter(e.target.value)} placeholder={field.placeholder} style={inputStyle} />
                      )}
                    </div>
                  ))}

                  {profileSuccess && (
                    <div style={{ background: 'rgba(0,200,100,0.1)', border: '1px solid rgba(0,200,100,0.3)', borderRadius: '12px', padding: '12px 16px', color: '#4ade80', fontSize: '14px', fontWeight: '600' }}>
                      ✅ Profile saved successfully!
                    </div>
                  )}

                  <button onClick={handleSaveProfile} disabled={savingProfile} style={{ background: savingProfile ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #E8C97E, #F0B429)', color: savingProfile ? 'rgba(255,255,255,0.4)' : 'black', fontWeight: '900', fontSize: '15px', borderRadius: '9999px', padding: '14px', border: 'none', cursor: savingProfile ? 'not-allowed' : 'pointer', width: '100%' }}>
                    {savingProfile ? 'Saving...' : 'Save Changes ✓'}
                  </button>

                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
