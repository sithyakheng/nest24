'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { uploadImage } from '@/lib/uploadImage'
import Link from 'next/link'
import { Star, Check, Medal, Store, ShoppingCart, ShoppingBag, Package, DollarSign, User, Settings, X, Flag, Bell, Search, Heart, ThumbsUp, ThumbsDown, BarChart3, Plus, AlertTriangle, Home, Edit, Trash2, TrendingUp, Users, Menu } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

export default function DashboardPage() {
  const router = useRouter()
  const [windowWidth, setWindowWidth] = useState(1200)
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
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
  const [profileName, setProfileName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [facebook, setFacebook] = useState('')
  const [instagram, setInstagram] = useState('')
  const [telegram, setTelegram] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [avatarSuccess, setAvatarSuccess] = useState(false)

  // Shop URL variables
  const [shopSlug, setShopSlug] = useState('')
  const [shopUrl, setShopUrl] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)

  const CATEGORIES = ['Electronics', 'Fashion', 'Home Living', 'Beauty', 'Food', 'Gaming', 'Other']

  const copyShopLink = async () => {
    try {
      await navigator.clipboard.writeText(shopUrl)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const glassCard = {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    color: '#0f172a',
    background: '#f8fafc',
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  const inputFocusProps = {}

  // Helper function to get product limit based on tier
  function getProductLimit(tier: number): number {
    const limits: Record<number, number> = {
      0: 2,    // tier 0 - free account
      1: 30,   // tier 1 - Starter
      2: 150,  // tier 2 - Verified
      3: 300   // tier 3 - Premium
    }
    return limits[tier] || 2
  }

  // Calculate total views and prepare chart data
  const totalViews = products.reduce((sum, product) => sum + (product.views || 0), 0)
  
  // Bar chart data - Views by Product
  const barChartData = products.map(product => ({
    name: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
    views: product.views || 0
  })).sort((a, b) => b.views - a.views).slice(0, 10) // Top 10 products

  // Line chart data - Views Over Time (grouped by day)
  const lineChartData = products.reduce((acc: any[], product) => {
    if (product.created_at) {
      const date = new Date(product.created_at).toLocaleDateString()
      const existing = acc.find(item => item.date === date)
      if (existing) {
        existing.views += product.views || 0
      } else {
        acc.push({
          date,
          views: product.views || 0
        })
      }
    }
    return acc
  }, []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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
    
    setProfile(profile)
    setProfileName(profile?.name || profile?.full_name || '')
    setDisplayName(profile?.name || profile?.full_name || '')
    setFullName(profile?.full_name || '')
    setBio(profile?.bio || '')
    setPhone(profile?.phone || '')
    setWhatsapp(profile?.whatsapp || '')
    setFacebook(profile?.facebook || '')
    setInstagram(profile?.instagram || '')
    setTelegram(profile?.telegram || '')
    setAvatarUrl(profile?.avatar_url || '')

    // Set shop URL variables
    const slug = profile?.shop_slug || (profile?.name || profile?.full_name || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()
    setShopSlug(slug)
    setShopUrl(`https://nest24.vercel.app/seller/${slug}`)
  }

  useEffect(() => {
    if (!profile) return

    async function fetchProducts() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', profile.id)
        .order('created_at', { ascending: false })
      setProducts(data || [])
    }

    async function fetchOrders() {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('seller_id', profile.id)
        .order('created_at', { ascending: false })
      setOrders(data || [])
    }

    fetchProducts()
    fetchOrders()
  }, [profile])

  async function handleAddProduct() {
    if (!productName || !productPrice || !productStock) {
      setAddError('Please fill in all required fields')
      return
    }

    if (products.length >= getProductLimit(profile?.tier || 0)) {
      const tier = profile?.tier || 0
      if (tier === 0) {
        setAddError(
          "You've reached your free limit of 2 products. Upgrade your tier to list more."
        )
      } else {
        setAddError(`Product limit reached (${getProductLimit(tier)} products)`)
      }
      return
    }

    setAddingProduct(true)
    setAddError('')

    try {
      let imageUrl = ''
      if (productImage) {
        imageUrl = await uploadImage(productImage)
      }

      const { error } = await supabase.from('products').insert({
        name: productName,
        description: productDesc,
        price: parseFloat(productPrice),
        compare_price: comparePrice ? parseFloat(comparePrice) : null,
        category: productCategory,
        stock: parseInt(productStock),
        discount: productDiscount ? parseInt(productDiscount) : null,
        image_url: imageUrl,
        seller_id: profile.id
      })

      if (error) throw error

      // Reset form
      setProductName('')
      setProductDesc('')
      setProductPrice('')
      setComparePrice('')
      setProductCategory('Electronics')
      setProductStock('')
      setProductDiscount('')
      setProductImage(null)
      setProductImagePreview(null)
      setAddSuccess(true)
      setTimeout(() => setAddSuccess(false), 3000)

      // Refresh products list
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', profile.id)
        .order('created_at', { ascending: false })
      setProducts(data || [])
    } catch (error) {
      setAddError('Failed to add product')
    } finally {
      setAddingProduct(false)
    }
  }

  async function handleDeleteProduct(productId: string, imageUrl: string) {
    if (!confirm('Delete this product?')) return
    
    // Delete image from Cloudinary if it exists
    if (imageUrl) {
      try {
        // Extract public_id from Cloudinary URL
        // Example: https://res.cloudinary.com/demo/image/upload/v123456/nestkh/product123.jpg
        // public_id would be: nestkh/product123
        const urlParts = imageUrl.split('/')
        const uploadIndex = urlParts.indexOf('upload')
        if (uploadIndex !== -1 && uploadIndex + 2 < urlParts.length) {
          // Skip version number and get the rest
          const publicIdWithExtension = urlParts.slice(uploadIndex + 2).join('/')
          const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '') // Remove file extension
          
          await fetch('/api/delete-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ public_id: publicId }),
          })
        }
      } catch (error) {
        console.error('Failed to delete image from Cloudinary:', error)
      }
    }
    
    // Delete product from Supabase
    await supabase.from('products').delete().eq('id', productId)
    setProducts(products.filter(p => p.id !== productId))
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    try {
      // Delete old avatar from Cloudinary if it exists
      if (avatarUrl && avatarUrl.includes('cloudinary')) {
        const urlParts = avatarUrl.split('/')
        const uploadIndex = urlParts.indexOf('upload')
        if (uploadIndex !== -1 && uploadIndex + 2 < urlParts.length) {
          const publicIdWithExtension = urlParts.slice(uploadIndex + 2).join('/')
          const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '')
          
          await fetch('/api/delete-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ public_id: publicId }),
          })
        }
      }
      
      // Upload new avatar
      const cloudinaryUrl = await uploadImage(file)
      
      if (cloudinaryUrl) {
        setAvatarUrl(cloudinaryUrl)
        
        // Update the database immediately
        const { error } = await supabase
          .from('profiles')
          .update({ avatar_url: cloudinaryUrl })
          .eq('id', user.id)
          
        if (error) {
          console.error('Avatar update error:', error)
        } else {
          // Show success message
          setAvatarSuccess(true)
          setTimeout(() => setAvatarSuccess(false), 3000)
        }
      }
    } catch (error) {
      console.error('Avatar upload error:', error)
    }
  }

  async function handleSaveProfile() {
    setSavingProfile(true)
    setProfileSuccess(false)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profileName,
          full_name: fullName,
          bio: bio,
          phone: phone,
          whatsapp: whatsapp,
          facebook: facebook,
          instagram: instagram,
          telegram: telegram,
          avatar_url: avatarUrl
        })
        .eq('id', user.id)

      if (error) throw error

      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    } catch (error) {
      console.error('Profile update error:', error)
    } finally {
      setSavingProfile(false)
    }
  }

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'products', label: 'My Products', icon: Package },
    { id: 'add-product', label: 'Add Product', icon: Plus },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const handleProductImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'nestkh')
    const res = await fetch('/api/upload-image', { method: 'POST', body: formData })
    const data = await res.json()
    if (data.url) setProductImage(data.url)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <div style={{
        width: isMobile ? (sidebarOpen ? '260px' : '0') : '260px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        transition: 'width 0.3s ease',
        position: isMobile ? 'fixed' : 'relative',
        height: '100vh',
        zIndex: isMobile ? 40 : 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Logo */}
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#004E64',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              N
            </div>
            <span style={{ color: '#1e293b', fontSize: '18px', fontWeight: '600' }}>NestKH</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav style={{ padding: '20px 0', flex: '1 0 auto', minHeight: '0' }}>
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 20px',
                border: 'none',
                backgroundColor: activeTab === item.id ? '#f0f9ff' : 'transparent',
                color: activeTab === item.id ? '#004E64' : '#64748b',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                borderLeft: activeTab === item.id ? '3px solid #004E64' : '3px solid transparent'
              }}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Shop Actions */}
        {profile && (
          <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', marginTop: 'auto' }}>
            <Link href={`/seller/${profile?.shop_slug || profile?.name || ''}`} style={{ textDecoration: 'none', display: 'block', marginBottom: '12px' }}>
              <button
                style={{
                  width: '100%',
                  backgroundColor: '#004E64',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#003a52';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#004E64';
                }}
              >
                My Shop
              </button>
            </Link>
            
            <button
              onClick={copyShopLink}
              style={{
                width: '100%',
                backgroundColor: '#ffffff',
                color: '#004E64',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              {copySuccess ? (
                <>
                  <span style={{ color: '#10b981' }}>✓</span>
                  <span style={{ color: '#10b981' }}>Copied!</span>
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  <span>Copy Shop Link</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 30
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header style={{
          height: '64px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px'
        }}>
          {/* Mobile menu button */}
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer'
              }}
            >
              <Menu size={20} color="#64748b" />
            </button>
          )}

          <div style={{ flex: 1 }} />

          {/* Seller Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#374151', fontSize: '14px', fontWeight: '500' }}>
              {profile?.name || profile?.full_name || 'Seller'}
            </span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {(profile?.name || profile?.full_name || 'S').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <h1 style={{ color: '#1e293b', fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>Dashboard Overview</h1>
              
              {/* Stats Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#f0f9ff',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Package size={20} color="#004E64" />
                    </div>
                    <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '500' }}>Total Products</span>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b' }}>{products.length}</div>
                </div>

                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#f0fdf4',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <TrendingUp size={20} color="#10b981" />
                    </div>
                    <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '500' }}>Total Views</span>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b' }}>{totalViews.toLocaleString()}</div>
                </div>

                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#fef3c7',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Star size={20} color="#f59e0b" />
                    </div>
                    <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '500' }}>Tier/Plan</span>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b' }}>
                    {profile?.rank ? profile.rank.charAt(0).toUpperCase() + profile.rank.slice(1) : 'Free'}
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#f0f9ff',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Users size={20} color="#00a8cc" />
                    </div>
                    <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '500' }}>Slots Remaining</span>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b' }}>
                    {getProductLimit(profile?.tier || 0) - products.length}
                  </div>
                </div>
              </div>

              {/* Analytics Section */}
              {barChartData.length > 0 && (
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <h2 style={{ 
                    color: '#1e293b', 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    marginBottom: '20px' 
                  }}>
                    Views by Product
                  </h2>
                  <div style={{ width: '100%', height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fill: '#64748b', fontSize: '12px' }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis 
                          tick={{ fill: '#64748b', fontSize: '12px' }}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                        />
                        <Bar 
                          dataKey="views" 
                          fill="#004E64"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Line Chart - Views Over Time */}
              {lineChartData.length > 0 && (
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <h2 style={{ 
                    color: '#1e293b', 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    marginBottom: '20px' 
                  }}>
                    Views Over Time
                  </h2>
                  <div style={{ width: '100%', height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={lineChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fill: '#64748b', fontSize: '12px' }}
                        />
                        <YAxis 
                          tick={{ fill: '#64748b', fontSize: '12px' }}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="views" 
                          stroke="#004E64" 
                          strokeWidth={2}
                          dot={{ fill: '#004E64', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div>
              <h1 style={{ color: '#1e293b', fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>My Products</h1>
              
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                overflow: 'hidden'
              }}>
                {/* Table Header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr 100px 100px 120px',
                  backgroundColor: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  padding: '12px 16px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  <div>Image</div>
                  <div>Name</div>
                  <div>Price</div>
                  <div>Status</div>
                  <div>Actions</div>
                </div>
              </div>
              {products.length === 0 ? (
                <div style={{ ...glassCard, padding: '48px', textAlign: 'center' }}>
                  <p style={{ color: '#475569', fontSize: '16px', marginBottom: '16px' }}>No products yet</p>
                  <button onClick={() => setActiveTab('add')} style={{ background: '#004E64', color: 'white', fontWeight: '700', borderRadius: '9999px', padding: '12px 28px', border: 'none', cursor: 'pointer' }}>
                    Add Your First Product
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {products.map(product => (
                    <div key={product.id} style={{ 
                    background: '#ffffff', 
                    border: '1px solid #e2e8f0', 
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
          {activeTab === 'add-product' && (
            <div>
              <h2 style={{ color: '#0f172a', fontSize: isMobile ? '18px' : '28px', fontWeight: '900', margin: '0 0 24px 0', overflowWrap: 'break-word', wordBreak: 'break-word' }}>Add New Product</h2>
              <div style={{ ...glassCard, padding: isMobile ? '16px' : '32px', maxWidth: '600px', width: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                  <div>
                    <label style={{ color: '#0f172a', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>Product Name</label>
                    <input type="text" value={productName} onChange={e => setProductName(e.target.value)} placeholder="Enter product name" style={inputStyle} {...inputFocusProps} />
                  </div>

                  <div>
                    <label style={{ color: '#0f172a', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>Description</label>
                    <textarea value={productDesc} onChange={e => setProductDesc(e.target.value)} placeholder="Describe your product" rows={4} style={{ ...inputStyle, resize: 'vertical' }} {...inputFocusProps} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '12px' : '12px' }}>
                    <div>
                      <label style={{ color: '#0f172a', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>Price ($)</label>
                      <input type="number" value={productPrice} onChange={e => setProductPrice(e.target.value)} placeholder="0.00" style={inputStyle} {...inputFocusProps} />
                    </div>
                    <div>
                      <label style={{ color: '#0f172a', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>Stock</label>
                      <input type="number" value={productStock} onChange={e => setProductStock(e.target.value)} placeholder="0" style={inputStyle} {...inputFocusProps} />
                    </div>
                  </div>

                  <div>
                    <label style={{ color: '#0f172a', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>Discount % (optional)</label>
                    <input type="number" value={productDiscount} onChange={e => setProductDiscount(e.target.value)} placeholder="0" min="0" max="100" style={inputStyle} {...inputFocusProps} />
                  </div>

                  <div>
                    <label style={{ color: '#0f172a', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>Category</label>
                    <select value={productCategory} onChange={e => setProductCategory(e.target.value)} style={inputStyle} {...inputFocusProps}>
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ color: '#0f172a', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>Product Image</label>
                    <div
                      onClick={() => document.getElementById('file-input')?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.currentTarget.style.borderColor = '#004E64';
                        e.currentTarget.style.backgroundColor = '#f0f9ff';
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                        
                        const files = e.dataTransfer.files;
                        if (files.length > 0 && files[0].type.startsWith('image/')) {
                          handleProductImage({ target: { files: [files[0]] } } as any);
                        }
                      }}
                      style={{
                        border: '2px dashed #e2e8f0',
                        backgroundColor: '#f8fafc',
                        height: '120px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textAlign: 'center',
                        padding: '16px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#cbd5e1';
                        e.currentTarget.style.backgroundColor = '#f1f5f9';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                      }}
                    >
                      <div>
                        <p style={{ color: '#64748b', fontSize: '14px', margin: 0, marginBottom: '4px' }}>Drag & drop image here or click to browse</p>
                        <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>PNG, JPG, GIF up to 10MB</p>
                      </div>
                    </div>
                    <input
                      id="file-input"
                      type="file"
                      onChange={handleProductImage}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                  </div>

                  {productImagePreview && (
                    <div style={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <p style={{ color: '#475569', fontSize: '12px', margin: 0 }}>Preview</p>
                      <img src={productImagePreview} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                    </div>
                  )}

                  {addError && (
                    <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '12px 16px', color: '#dc2626', fontSize: '14px', fontWeight: '600' }}>
                      <div>
                        {addError}
                        {(profile?.tier || 0) === 0 && addError.includes('free limit of 2 products') && (
                          <div style={{ marginTop: '12px' }}>
                            <Link href="/ranks">
                              <button style={{
                                backgroundColor: '#004E64',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '8px 16px',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                textDecoration: 'none'
                              }}>
                                🚀 Upgrade Your Tier
                              </button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {addSuccess && (
                    <div style={{ backgroundColor: 'rgba(0,200,100,0.1)', border: '1px solid rgba(0,200,100,0.3)', borderRadius: '12px', padding: '12px 16px', color: '#4ade80', fontSize: '14px', fontWeight: '600' }}>
                      ✅ Product added successfully!
                    </div>
                  )}

                  <button onClick={handleAddProduct} disabled={addingProduct} style={{ background: addingProduct ? '#f8fafc' : '#004E64', color: addingProduct ? '#475569' : 'white', fontWeight: '900', fontSize: '15px', borderRadius: '9999px', padding: '14px', border: 'none', cursor: addingProduct ? 'not-allowed' : 'pointer', width: '100%' }}>
                    {addingProduct ? 'Adding Product...' : 'Add Product'}
                  </button>

                </div>
              </div>
            </div>
          )}

          {/* ORDERS */}
          {activeTab === 'orders' && (
            <div>
              <h2 style={{ color: '#0f172a', fontSize: isMobile ? '18px' : '28px', fontWeight: '900', margin: '0 0 24px 0', overflowWrap: 'break-word', wordBreak: 'break-word' }}>Orders</h2>
              {orders.length === 0 ? (
                <div style={{ ...glassCard, padding: '48px', textAlign: 'center' }}>
                  <p style={{ color: '#475569', fontSize: '16px' }}>No orders yet</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {orders.map(order => (
                    <div key={order.id} style={{ ...glassCard, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
                      <p style={{ color: '#475569', fontSize: '12px', fontFamily: 'monospace', margin: 0 }}>#{order.id.slice(0,8)}</p>
                      <p style={{ color: '#0f172a', fontWeight: '600', margin: 0, overflowWrap: 'break-word', wordBreak: 'break-word' }}>{order.products?.name}</p>
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
          {activeTab === 'settings' && (
            <div>
              <h2 style={{ color: '#0f172a', fontSize: isMobile ? '18px' : '28px', fontWeight: '900', margin: '0 0 24px 0', overflowWrap: 'break-word', wordBreak: 'break-word' }}>Profile Settings</h2>
              <div style={{ ...glassCard, padding: isMobile ? '16px' : '32px', maxWidth: '600px', width: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                  {/* Profile Picture Upload */}
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    {/* Avatar preview */}
                    <div style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      background: '#e2e8f0',
                      margin: '0 auto 12px',
                      overflow: 'hidden',
                      border: '3px solid #10B981'
                    }}>
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ 
                          width: '100%', height: '100%', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '36px', background: '#10B981', color: 'white', fontWeight: '900'
                        }}>
                          {profileName?.[0]?.toUpperCase() || 'S'}
                        </div>
                      )}
                    </div>
                    
                    <label style={{
                      background: '#10B981',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}>
                      📷 Change Photo
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleAvatarUpload}
                      />
                    </label>
                  </div>

                  {avatarSuccess && (
                    <div style={{ background: 'rgba(0,200,100,0.1)', border: '1px solid rgba(0,200,100,0.3)', borderRadius: '12px', padding: '12px 16px', color: '#4ade80', fontSize: '14px', fontWeight: '600', marginTop: '12px' }}>
                      ✅ Photo updated!
                    </div>
                  )}

                  {/* Shop Name */}
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                      Shop Name
                    </label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Your shop name"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '14px',
                        marginTop: '4px'
                      }}
                    />
                  </div>

                  {[
                    { label: 'Full Name', value: fullName, setter: setFullName, placeholder: 'Your full name' },
                    { label: 'Bio', value: bio, setter: setBio, placeholder: 'Tell buyers about yourself', textarea: true },
                    { label: 'Phone', value: phone, setter: setPhone, placeholder: '+855 xx xxx xxxx' },
                    { label: 'WhatsApp', value: whatsapp, setter: setWhatsapp, placeholder: '+855 xx xxx xxxx' },
                    { label: 'Facebook', value: facebook, setter: setFacebook, placeholder: 'facebook.com/yourpage' },
                    { label: 'Instagram', value: instagram, setter: setInstagram, placeholder: '@yourhandle' },
                    { label: 'Telegram', value: telegram, setter: setTelegram, placeholder: '@yourhandle' },
                    { label: 'Shop URL', value: shopSlug, setter: setShopSlug, placeholder: 'myshopname' },
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
                      ✅ Profile updated successfully!
                    </div>
                  )}

                  <button onClick={handleSaveProfile} disabled={savingProfile} style={{ background: savingProfile ? '#f8fafc' : '#004E64', color: savingProfile ? '#475569' : 'white', fontWeight: '900', fontSize: '15px', borderRadius: '9999px', padding: '14px', border: 'none', cursor: savingProfile ? 'not-allowed' : 'pointer', width: '100%' }}>
                    {savingProfile ? 'Saving...' : 'Save Changes'}
                  </button>

                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
