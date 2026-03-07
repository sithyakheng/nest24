'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { uploadImage } from '@/lib/uploadImage'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const [windowWidth, setWindowWidth] = useState(1200)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  function sanitize(str: string): string {
    return str
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim()
  }

  useEffect(() => {
    setWindowWidth(window.innerWidth)
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isMobile = windowWidth < 768

  const [products, setProducts] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  // Add Product form state
  const [productName, setProductName] = useState('')
  const [productDesc, setProductDesc] = useState('')
  const [productPrice, setProductPrice] = useState('')
  const [comparePrice, setComparePrice] = useState('')
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
    setUser(user)
    
    await loadProfile(user)
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

  if (profile?.banned) {
    await supabase.auth.signOut()
    window.location.href = '/'
    return
  }

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

async function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (e) => {
      const img = new Image()
      img.src = e.target?.result as string
      img.onload = () => {
        const canvas = document.createElement('canvas')
        
        // Max width 1200px
        let width = img.width
        let height = img.height
        if (width > 1200) {
          height = Math.round((height * 1200) / width)
          width = 1200
        }
        
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File(
                [blob], 
                file.name.replace(/\.[^/.]+$/, '.webp'),
                { type: 'image/webp' }
              )
              console.log(
                `Compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB` 
              )
              resolve(compressedFile)
            } else {
              resolve(file)
            }
          },
          'image/webp',
          0.82
        )
      }
    }
  })
}

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

    const price = parseFloat(productPrice)
    const stock = parseInt(productStock)

    if (isNaN(price) || price <= 0) {
      setAddError('Please enter a valid price.')
      return
    }

    if (isNaN(stock) || stock < 0) {
      setAddError('Please enter a valid stock number.')
      return
    }

    if (comparePrice && parseFloat(comparePrice) <= price) {
      setAddError('Compare price must be higher than actual price.')
      return
    }

    if (productName.length < 3) {
      setAddError('Product name must be at least 3 characters.')
      return
    }

    if (productName.length > 100) {
      setAddError('Product name too long. Max 100 characters.')
      return
    }

    setAddingProduct(true)
    setAddError('')

    let imageUrl = ''

    if (productImage) {
      try {
        setAddError('')
        console.log('Compressing image...')
        const compressed = await compressImage(productImage)
        console.log('Uploading to Cloudinary...')
        imageUrl = await uploadImage(compressed)
        console.log('Cloudinary URL:', imageUrl)
      } catch (err: any) {
        setAddError('Image upload failed: ' + err.message)
        setAddingProduct(false)
        return
      }
    }

    const insertData = {
      seller_id: user.id,
      name: sanitize(productName),
      description: sanitize(productDesc),
      price: parseFloat(productPrice),
      compare_price: comparePrice ? parseFloat(comparePrice) : null,
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
    setComparePrice('')
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

  async function handleDeleteProduct(productId: string, imageUrl: string) {
  if (!confirm('Are you sure you want to delete this product?')) return

  if (imageUrl && imageUrl.includes('cloudinary.com')) {
  try {
    const urlParts = imageUrl.split('/upload/')
    if (urlParts[1]) {
      let publicId = urlParts[1].replace(/^v\d+\//, '')
      publicId = publicId.replace(/\.[^/.]+$/, '')
      console.log('Deleting from Cloudinary:', publicId)
      await fetch('/api/delete-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_id: publicId })
      })
    }
  } catch (e) {
    console.log('Cloudinary delete error:', e)
  }
}

  // Delete product from database
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)

  if (error) {
    alert('Failed to delete: ' + error.message)
    return
  }

  setProducts(prev => prev.filter((p: any) => p.id !== productId))
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
    <div style={{ minHeight: '100vh', background: '#f8fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(15,23,42,0.4)', fontSize: '16px' }}>
      Loading Dashboard...
    </div>
  )

  const glassCard = {
    background: 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(0,0,0,0.08)',
    borderTop: '1px solid rgba(255,255,255,0.95)',
    borderRadius: '20px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
  }

  const inputStyle = {
    width: '100%',
    background: 'rgba(0,0,0,0.04)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(0,0,0,0.1)',
    borderRadius: '12px',
    color: '#0f172a',
    padding: '12px 16px',
    fontSize: isMobile ? '16px' : '14px',
    outline: 'none',
    boxSizing: 'border-box' as const
  }

  const inputFocusProps = {
    onFocus: (e: any) => { 
      e.currentTarget.style.borderColor = 'rgba(16,185,129,0.5)'
      e.currentTarget.style.boxShadow = '0 0 0 2px rgba(16,185,129,0.1)'
    },
    onBlur: (e: any) => { 
      e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'
      e.currentTarget.style.boxShadow = 'none'
    }
  }

  const navItems = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'products', label: '📦 My Products' },
    { id: 'add', label: '➕ Add Product' },
    { id: 'orders', label: '🛒 Orders' },
    { id: 'profile', label: '👤 Profile Settings' },
  ]

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#f8fafb',
      width: '100%',
      overflowX: 'hidden',
      WebkitTextSizeAdjust: '100%',
      textSizeAdjust: '100%'
    }}>

      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-150px', left: '-100px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '-150px', right: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div style={{ width: '100%', position: 'relative', zIndex: 10, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '260px 1fr', gap: '24px', alignItems: 'start' }}>

      {/* Mobile Top Bar */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <p style={{ color: '#0f172a', fontWeight: '900', fontSize: '18px', margin: 0 }}>
            NestKH<span style={{ color: '#10B981' }}>.</span>
          </p>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'rgba(0,0,0,0.06)',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: '10px',
              padding: '8px 12px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ width: '18px', height: '2px', background: '#0f172a', borderRadius: '2px', transition: 'all 0.3s', transform: sidebarOpen ? 'rotate(45deg) translateY(6px)' : 'none' }} />
            <div style={{ width: '18px', height: '2px', background: '#0f172a', borderRadius: '2px', transition: 'all 0.3s', opacity: sidebarOpen ? 0 : 1 }} />
            <div style={{ width: '18px', height: '2px', background: '#0f172a', borderRadius: '2px', transition: 'all 0.3s', transform: sidebarOpen ? 'rotate(-45deg) translateY(-6px)' : 'none' }} />
          </button>
        </div>
      )}

        {/* SIDEBAR */}
        <div style={{
          ...glassCard, 
          padding: '24px', 
          position: isMobile ? 'fixed' : 'sticky',
          top: isMobile ? 0 : '24px',
          left: isMobile ? 0 : 'auto',
          height: isMobile ? '100vh' : 'auto',
          zIndex: isMobile ? 200 : 'auto',
          transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowY: 'auto'
        }}>
          {/* Add close button at top for mobile */}
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(0,0,0,0.06)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                color: '#0f172a',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
          )}
          <div style={{ textAlign: 'center', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16,185,129,0.4)', border: '2px solid rgba(16,185,129,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', fontWeight: '900', fontSize: '24px', margin: '0 auto 12px auto' }}>
              {(profile?.name || profile?.full_name || 'S').charAt(0).toUpperCase()}
            </div>
            <p style={{ color: '#0f172a', fontWeight: '700', fontSize: '15px', margin: '0 0 4px 0' }}>{profile?.name || profile?.full_name || 'Seller'}</p>
            <span style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981', fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '9999px' }}>Seller</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Link href="/">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '12px', color: 'rgba(15,23,42,0.5)', fontSize: '14px', cursor: 'pointer', marginBottom: '8px', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.04)' }}>
                ← Back to Store
              </div>
            </Link>

            {navItems.map(item => (
              <div
                key={item.id}
                onClick={() => { setActiveTab(item.id); if(isMobile) setSidebarOpen(false) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 14px', borderRadius: '12px',
                  color: activeTab === item.id ? '#10B981' : 'rgba(15,23,42,0.6)',
                  fontSize: '14px', fontWeight: activeTab === item.id ? '600' : '400',
                  cursor: 'pointer',
                  background: activeTab === item.id ? 'rgba(16,185,129,0.1)' : 'transparent',
                  border: activeTab === item.id ? '1px solid rgba(16,185,129,0.2)' : '1px solid transparent',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = activeTab === item.id ? 'rgba(16,185,129,0.1)' : 'rgba(0,0,0,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = activeTab === item.id ? 'rgba(16,185,129,0.1)' : 'transparent'}
              >
                {item.label}
              </div>
            ))}

            <Link href="/dashboard/ranks">
              <div onClick={() => { if(isMobile) setSidebarOpen(false) }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '12px', color: '#F59E0B', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginTop: '8px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
                🏆 Get Ranked
              </div>
            </Link>

            <div
              onClick={async () => { await supabase.auth.signOut(); router.push('/') }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '12px', color: '#ef4444', fontSize: '14px', cursor: 'pointer', marginTop: '4px', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              🚪 Sign Out
            </div>
          </div>
        </div>

        {/* Dark overlay for mobile */}
        {isMobile && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 199,
              background: 'rgba(0,0,0,0.4)',
              opacity: sidebarOpen ? 1 : 0,
              pointerEvents: sidebarOpen ? 'all' : 'none',
              transition: 'opacity 0.4s ease'
            }}
          />
        )}

        {/* MAIN CONTENT */}
        <div style={{
          flex: 1,
          padding: isMobile ? '70px 12px 40px 12px' : '32px',
          overflowY: 'auto',
          minWidth: 0
        }}>

          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              <p style={{ color: 'rgba(15,23,42,0.4)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>DASHBOARD</p>
              <h1 style={{ color: '#0f172a', fontSize: isMobile ? '18px' : '32px', fontWeight: '900', margin: '0 0 24px 0', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                Welcome, {profile?.name || profile?.full_name || 'Seller'} 👋
              </h1>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? '10px' : '20px', marginBottom: '24px' }}>
                {[
                  { label: 'Total Products', value: products.length, color: '#10B981' },
                  { label: 'Total Orders', value: orders.length, color: '#F59E0B' },
                  { label: 'Pending Orders', value: orders.filter(o => o.status === 'pending').length, color: '#f87171' },
                  { label: 'Current Rank', value: profile?.rank && profile.rank !== 'none' ? profile.rank.charAt(0).toUpperCase() + profile.rank.slice(1) : 'None', color: '#a78bfa' },
                ].map((stat, i) => (
                  <div key={i} style={{ 
                    background: 'rgba(255,255,255,0.9)', 
                    border: '1px solid rgba(0,0,0,0.06)', 
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)', 
                    padding: isMobile ? '16px' : '20px', 
                    borderRadius: isMobile ? '16px' : '16px'
                  }}>
                    <p style={{ color: 'rgba(15,23,42,0.5)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px 0' }}>{stat.label}</p>
                    <p style={{ color: stat.color, fontSize: '32px', fontWeight: '900', margin: 0 }}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Rank Status */}
              <div style={{
                background: profile?.rank && profile.rank !== 'none'
                  ? profile.rank === 'premium' 
                    ? 'rgba(245,158,11,0.08)' 
                    : profile.rank === 'verified'
                    ? 'rgba(16,185,129,0.08)'
                    : 'rgba(59,130,246,0.08)'
                  : 'rgba(255,255,255,0.04)',
                border: `1px solid ${profile?.rank && profile.rank !== 'none'
                  ? profile.rank === 'premium'
                    ? 'rgba(245,158,11,0.25)'
                    : profile.rank === 'verified'
                    ? 'rgba(16,185,129,0.3)'
                    : 'rgba(59,130,246,0.25)'
                  : 'rgba(255,255,255,0.08)'}`,
                borderRadius: isMobile ? '16px' : '16px',
                padding: isMobile ? '16px' : '20px 24px',
                marginTop: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: isMobile ? '16px' : '12px',
                flexDirection: isMobile ? 'column' : 'row'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontSize: '32px' }}>
                    {profile?.rank === 'premium' ? '⭐' : profile?.rank === 'verified' ? '✓' : profile?.rank === 'starter' ? '🥉' : '🏅'}
                  </span>
                  <div>
                    <p style={{ color: 'rgba(15,23,42,0.4)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px 0' }}>
                      Your Rank
                    </p>
                    <p style={{ 
                      fontWeight: '900', fontSize: '20px', margin: 0,
                      color: profile?.rank === 'premium' ? '#F59E0B' : profile?.rank === 'verified' ? '#10B981' : profile?.rank === 'starter' ? '#93c5fd' : 'rgba(15,23,42,0.4)'
                    }}>
                      {profile?.rank && profile.rank !== 'none' 
                        ? profile.rank.charAt(0).toUpperCase() + profile.rank.slice(1) 
                        : 'No Rank Yet'}
                    </p>
                    {profile?.rank && profile.rank !== 'none' && (
                      <p style={{ color: 'rgba(15,23,42,0.4)', fontSize: '12px', margin: '4px 0 0 0' }}>
                        Your products have a {profile.rank} badge visible to all buyers
                      </p>
                    )}
                  </div>
                </div>
                <Link href="/dashboard/ranks">
                  <button style={{
                    background: profile?.rank && profile.rank !== 'none' 
                      ? 'rgba(255,255,255,0.06)' 
                      : 'linear-gradient(135deg, #F59E0B, #D97706)',
                    color: profile?.rank && profile.rank !== 'none' ? 'rgba(15,23,42,0.6)' : 'black',
                    fontWeight: '700',
                    borderRadius: '9999px',
                    padding: '10px 22px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    width: isMobile ? '100%' : 'auto'
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
                <h2 style={{ color: 'white', fontSize: isMobile ? '18px' : '28px', fontWeight: '900', margin: 0, overflowWrap: 'break-word', wordBreak: 'break-word' }}>My Products</h2>
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
                    <div key={product.id} style={{ 
                    background: 'rgba(255,255,255,0.8)', 
                    border: '1px solid rgba(0,0,0,0.06)', 
                    padding: '16px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: isMobile ? '10px' : '16px', 
                    borderRadius: '16px',
                    flexDirection: isMobile ? 'column' : 'row'
                  }}>
                      <div style={{ width: '60px', height: '60px', borderRadius: '12px', overflow: 'hidden', background: 'rgba(0,0,0,0.04)', flexShrink: 0 }}>
                        {product.image_url && <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: '#0f172a', fontWeight: '600', margin: '0 0 4px 0', overflowWrap: 'break-word', wordBreak: 'break-word' }}>{product.name}</p>
                        <p style={{ color: 'rgba(15,23,42,0.5)', fontSize: '13px', margin: 0 }}>{product.category} · ${product.price} · Stock: {product.stock}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexDirection: isMobile ? 'row' : 'row', width: isMobile ? '100%' : 'auto' }}>
                        <Link href={`/products/${product.id}`}>
                          <button style={{ background: 'rgba(16,185,129,0.3)', border: '1px solid rgba(16,185,129,0.5)', color: '#10B981', borderRadius: '9999px', padding: '8px 16px', cursor: 'pointer', fontSize: '13px', flex: isMobile ? 1 : 'auto' }}>
                            View
                          </button>
                        </Link>
                        <button onClick={() => handleDeleteProduct(product.id, product.image_url)} style={{ background: 'rgba(255,80,80,0.15)', border: '1px solid rgba(255,80,80,0.3)', color: '#f87171', borderRadius: '9999px', padding: '8px 16px', cursor: 'pointer', fontSize: '13px', flex: isMobile ? 1 : 'auto' }}>
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
              <h2 style={{ color: '#0f172a', fontSize: isMobile ? '18px' : '28px', fontWeight: '900', margin: '0 0 24px 0', overflowWrap: 'break-word', wordBreak: 'break-word' }}>Add New Product</h2>
              <div style={{ ...glassCard, padding: isMobile ? '16px' : '32px', maxWidth: '600px', width: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                  <div>
                    <label style={{ color: 'rgba(15,23,42,0.5)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>Product Name</label>
                    <input type="text" value={productName} onChange={e => setProductName(e.target.value)} placeholder="Enter product name" style={inputStyle} {...inputFocusProps} />
                  </div>

                  <div>
                    <label style={{ color: 'rgba(15,23,42,0.5)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>Description</label>
                    <textarea value={productDesc} onChange={e => setProductDesc(e.target.value)} placeholder="Describe your product" rows={4} style={{ ...inputStyle, resize: 'vertical' }} {...inputFocusProps} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '12px' : '12px' }}>
                    <div>
                      <label style={{ color: 'rgba(15,23,42,0.5)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>Price ($)</label>
                      <input type="number" value={productPrice} onChange={e => setProductPrice(e.target.value)} placeholder="0.00" style={inputStyle} {...inputFocusProps} />
                    </div>
                    <div>
                      <label style={{ color: 'rgba(15,23,42,0.5)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>Stock</label>
                      <input type="number" value={productStock} onChange={e => setProductStock(e.target.value)} placeholder="0" style={inputStyle} {...inputFocusProps} />
                    </div>
                  </div>

                  <div>
                    <label style={{ color: 'rgba(15,23,42,0.5)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
                      Compare Price ($) <span style={{ color: 'rgba(15,23,42,0.35)', fontSize: '11px', fontWeight: '400', textTransform: 'none' }}>— shows as crossed out</span>
                    </label>
                    <input
                      type="number"
                      value={comparePrice}
                      onChange={e => setComparePrice(e.target.value)}
                      placeholder="0.00"
                      style={inputStyle}
                      onFocus={e => e.currentTarget.style.borderColor = 'rgba(16,185,129,0.5)'}
                      onBlur={e => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)'}
                    />
                    <p style={{ color: 'rgba(15,23,42,0.35)', fontSize: '11px', marginTop: '4px' }}>
                      Set higher than actual price to show a discount
                    </p>
                  </div>

                  {/* Live preview */}
                  {productPrice && comparePrice && parseFloat(comparePrice) > parseFloat(productPrice) && (
                    <div style={{
                      background: 'rgba(16,185,129,0.06)',
                      border: '1px solid rgba(16,185,129,0.2)',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <p style={{ color: 'rgba(15,23,42,0.4)', fontSize: '13px', margin: 0, textDecoration: 'line-through' }}>
                        ${parseFloat(comparePrice).toFixed(2)}
                      </p>
                      <p style={{ color: '#10B981', fontWeight: '900', fontSize: '20px', margin: 0 }}>
                        ${parseFloat(productPrice).toFixed(2)}
                      </p>
                      <span style={{
                        background: 'linear-gradient(135deg, #f87171, #ef4444)',
                        color: 'white',
                        fontSize: '11px',
                        fontWeight: '800',
                        padding: '3px 10px',
                        borderRadius: '9999px'
                      }}>
                        {Math.round((1 - parseFloat(productPrice) / parseFloat(comparePrice)) * 100)}% OFF
                      </span>
                      <p style={{ color: 'rgba(15,23,42,0.4)', fontSize: '12px', margin: 0 }}>Preview</p>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ color: 'rgba(15,23,42,0.5)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>Category</label>
                      <select value={productCategory} onChange={e => setProductCategory(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                        {CATEGORIES.map(cat => <option key={cat} value={cat} style={{ background: '#0d0e12' }}>{cat}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ color: 'rgba(15,23,42,0.5)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>Discount (%)</label>
                      <input type="number" value={productDiscount} onChange={e => setProductDiscount(e.target.value)} placeholder="0" style={inputStyle} {...inputFocusProps} />
                    </div>
                  </div>

                  <div>
                    <label style={{ color: 'rgba(15,23,42,0.5)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>Product Image</label>
                    <div onClick={() => document.getElementById('product-image-upload')?.click()} style={{ background: 'rgba(0,0,0,0.02)', border: productImagePreview ? '1px solid rgba(16,185,129,0.5)' : '2px dashed rgba(15,23,42,0.15)', borderRadius: '16px', padding: '24px', textAlign: 'center', cursor: 'pointer', overflow: 'hidden' }}>
                      {productImagePreview ? (
                        <img src={productImagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', objectFit: 'contain' }} />
                      ) : (
                        <div>
                          <p style={{ color: 'rgba(15,23,42,0.4)', fontSize: '14px', margin: '0 0 4px 0' }}>📸 Upload Product Image</p>
                          <p style={{ color: 'rgba(15,23,42,0.25)', fontSize: '12px', margin: 0 }}>Click to browse</p>
                        </div>
                      )}
                    </div>
                    <input id="product-image-upload" type="file" accept="image/*" onChange={e => {
                      const f = e.target.files?.[0]
                      if (!f) return

                      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
                      if (!allowedTypes.includes(f.type)) {
                        setAddError('Only JPG, PNG or WebP images allowed.')
                        return
                      }

                      if (f.size > 10 * 1024 * 1024) {
                        setAddError('Image too large. Max 10MB.')
                        return
                      }

                      setProductImage(f)
                      setProductImagePreview(URL.createObjectURL(f))
                      setAddError('')
                    }} style={{ display: 'none' }} />
                  </div>

                  {productImage && (
                    <p style={{ color: 'rgba(15,23,42,0.4)', fontSize: '11px', marginTop: '6px', textAlign: 'center' }}>
                      Original: {(productImage.size / 1024 / 1024).toFixed(2)}MB → Will be compressed automatically ✓
                    </p>
                  )}

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

                  <button onClick={handleAddProduct} disabled={addingProduct} style={{ background: addingProduct ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #10B981, #059669)', color: addingProduct ? 'rgba(255,255,255,0.4)' : 'white', fontWeight: '900', fontSize: '15px', borderRadius: '9999px', padding: '14px', border: 'none', cursor: addingProduct ? 'not-allowed' : 'pointer', width: '100%' }}>
                    {addingProduct ? 'Adding Product...' : 'Add Product ✓'}
                  </button>

                </div>
              </div>
            </div>
          )}

          {/* ORDERS */}
          {activeTab === 'orders' && (
            <div>
              <h2 style={{ color: 'white', fontSize: isMobile ? '18px' : '28px', fontWeight: '900', margin: '0 0 24px 0', overflowWrap: 'break-word', wordBreak: 'break-word' }}>Orders</h2>
              {orders.length === 0 ? (
                <div style={{ ...glassCard, padding: '48px', textAlign: 'center' }}>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '16px' }}>No orders yet</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {orders.map(order => (
                    <div key={order.id} style={{ ...glassCard, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontFamily: 'monospace', margin: 0 }}>#{order.id.slice(0,8)}</p>
                      <p style={{ color: 'white', fontWeight: '600', margin: 0, overflowWrap: 'break-word', wordBreak: 'break-word' }}>{order.products?.name}</p>
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
              <h2 style={{ color: '#0f172a', fontSize: isMobile ? '18px' : '28px', fontWeight: '900', margin: '0 0 24px 0', overflowWrap: 'break-word', wordBreak: 'break-word' }}>Profile Settings</h2>
              <div style={{ ...glassCard, padding: isMobile ? '16px' : '32px', maxWidth: '600px', width: '100%' }}>
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
                      <label style={{ color: 'rgba(15,23,42,0.5)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>{field.label}</label>
                      {field.textarea ? (
                        <textarea value={field.value} onChange={(e: any) => field.setter(e.target.value)} placeholder={field.placeholder} rows={3} style={{ ...inputStyle, resize: 'vertical' }} {...inputFocusProps} />
                      ) : (
                        <input type="text" value={field.value} onChange={(e: any) => field.setter(e.target.value)} placeholder={field.placeholder} style={inputStyle} {...inputFocusProps} />
                      )}
                    </div>
                  ))}

                  {profileSuccess && (
                    <div style={{ background: 'rgba(0,200,100,0.1)', border: '1px solid rgba(0,200,100,0.3)', borderRadius: '12px', padding: '12px 16px', color: '#4ade80', fontSize: '14px', fontWeight: '600' }}>
                      ✅ Profile saved successfully!
                    </div>
                  )}

                  <button onClick={handleSaveProfile} disabled={savingProfile} style={{ background: savingProfile ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #F59E0B, #D97706)', color: savingProfile ? 'rgba(255,255,255,0.4)' : 'black', fontWeight: '900', fontSize: '15px', borderRadius: '9999px', padding: '14px', border: 'none', cursor: savingProfile ? 'not-allowed' : 'pointer', width: '100%' }}>
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
