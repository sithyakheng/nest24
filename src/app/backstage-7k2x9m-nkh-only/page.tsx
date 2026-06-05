'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Settings, Check, X, Star, Medal, Store, ShoppingCart, Package, DollarSign, User, ShoppingBag, Search, MessageSquare, Phone, Ship, Ban, Users } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import Link from 'next/link'
import { useCountUp } from '@/hooks/useCountUp'

export default function AdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('analytics')
  const [rankRequests, setRankRequests] = useState<any[]>([])
  const [sellers, setSellers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [bannedUsers, setBannedUsers] = useState<any[]>([])
  const [productCounts, setProductCounts] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [totalSellers, setTotalSellers] = useState(0)
  const [totalBuyers, setTotalBuyers] = useState(0)
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalOrders, setTotalOrders] = useState(0)
  const [totalReports, setTotalReports] = useState(0)
  const [totalBanned, setTotalBanned] = useState(0)
  const [premiumSellers, setPremiumSellers] = useState(0)
  const [verifiedSellers, setVerifiedSellers] = useState(0)
  const [starterSellers, setStarterSellers] = useState(0)
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [userGrowth, setUserGrowth] = useState<any[]>([])
  const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([])
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [analyticsLoaded, setAnalyticsLoaded] = useState(false)
  const [subscriptionSearch, setSubscriptionSearch] = useState('')

  const growthData = useMemo(() => {
    const monthCounts: Record<string, number> = {}
    const sorted = [...userGrowth].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    sorted.forEach((item: any) => {
      const date = new Date(item.created_at)
      if (Number.isNaN(date.getTime())) return
      const monthLabel = date.toLocaleString('default', { year: 'numeric', month: 'short' })
      monthCounts[monthLabel] = (monthCounts[monthLabel] || 0) + 1
    })
    let cumulative = 0
    return Object.entries(monthCounts).map(([month, count]) => ({ month, users: cumulative += count }))
  }, [userGrowth])
  const [productSearch, setProductSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [assignState, setAssignState] = useState<Record<string, any>>({})

  const openAssign = (seller: any) => {
    setAssignState(prev => ({
      ...prev,
      [seller.id]: {
        open: true,
        selectedTier: seller.tier ?? 0,
        selectedRank: seller.rank ?? null,
        planType: seller.tier_forever === true ? 'forever' : 'custom',
        expiry: seller.tier_expires_at ? new Date(seller.tier_expires_at).toISOString().slice(0,10) : '',
        loading: false,
        message: null
      }
    }))
  }

  const closeAssign = (sellerId: string) => {
    setAssignState(prev => ({ ...prev, [sellerId]: { ...(prev[sellerId] || {}), open: false } }))
  }

  const setAssignField = (sellerId: string, field: string, value: any) => {
    setAssignState(prev => ({ ...prev, [sellerId]: { ...(prev[sellerId] || {}), [field]: value } }))
  }

  const assignRankToSeller = async (seller: any) => {
    const s = assignState[seller.id]
    if (!s) return
    setAssignField(seller.id, 'loading', true)

    const selectedTier = s.selectedTier === 0 ? 0 : Number(s.selectedTier)
    const selectedRank = selectedTier === 0 ? null : (selectedTier === 1 ? 'starter' : selectedTier === 2 ? 'verified' : 'premium')
    const sellerId = seller.id

    try {
      await adminAction({
        action: 'assignRank',
        sellerId,
        selectedTier,
        selectedRank,
      })

      setSellers(prev => prev.map(p => p.id === sellerId ? { ...p, tier: selectedTier, rank: selectedRank, tier_forever: true, tier_expires_at: null } : p))
      setAssignField(seller.id, 'message', { type: 'success', text: 'Rank assigned successfully!' })
      setAssignField(seller.id, 'loading', false)
      setTimeout(() => closeAssign(seller.id), 1200)
    } catch (e: any) {
      setAssignField(seller.id, 'message', { type: 'error', text: 'Failed to assign rank: ' + (e.message || e) })
      setAssignField(seller.id, 'loading', false)
    }
  }

  // Approve handler for rank requests
  const handleApprove = async (request: any) => {
    const rankMap: Record<number, string> = { 1: 'starter', 2: 'verified', 3: 'premium' }
    const rankStr = typeof request.rank === 'number'
      ? rankMap[request.rank as number] || 'starter'
      : request.rank

    try {
      await adminAction({
        action: 'approveRankRequest',
        requestId: request.id,
        rank: rankStr,
        screenshotUrl: request.screenshot_url || null,
      })
      alert('Rank request approved!')
      fetchAll()
    } catch (e: any) {
      alert('Failed to approve rank request: ' + (e.message || 'Unknown error'))
    }
  }

  // Reject handler for rank requests
  const handleReject = async (request: any) => {
    try {
      await adminAction({
        action: 'rejectRankRequest',
        requestId: request.id,
        screenshotUrl: request.screenshot_url || null,
      })
      alert('Rank request rejected!')
      fetchAll()
    } catch (e: any) {
      alert('Failed to reject rank request: ' + (e.message || 'Unknown error'))
    }
  }

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/'; return }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      if (profile?.role !== 'admin') { window.location.href = '/'; return }
      
      // Check if user has completed PIN verification
      const isPinVerified = sessionStorage.getItem('admin_pin_verified') === 'true'
      if (!isPinVerified) {
        window.location.href = '/backstage-7k2x9m-nkh-only/pin'
        return
      }

      setIsAdmin(true)
      
      // Initial fetch
      fetchAll()

      // Listen for new profiles (new users)
      const profilesSub = supabase
        .channel('profiles-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'profiles' },
          () => { fetchAll() }
        )
        .subscribe()

      // Listen for new rank requests
      const rankSub = supabase
        .channel('rank-requests-changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'rank_requests' },
          () => { fetchAll() }
        )
        .subscribe()

      // Listen for new products
      const productsSub = supabase
        .channel('products-changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'products' },
          () => { fetchAll() }
        )
        .subscribe()

      // Cleanup on unmount
      return () => {
        supabase.removeChannel(profilesSub)
        supabase.removeChannel(rankSub)
        supabase.removeChannel(productsSub)
      }
    }
    checkAdmin()
  }, [])

  useEffect(() => {
    fetchBannedUsers()
  }, [])

  const extractPublicId = (url: string) => {
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    const pathAfterUpload = parts.slice(uploadIndex + 2).join('/');
    return pathAfterUpload.replace(/\.[^/.]+$/, '');
  };

  async function adminAction(payload: any) {
    const response = await fetch('/api/admin/user-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data?.error || 'Admin action failed')
    }
    return data
  }

  async function fetchBannedUsers() {
    const { data: bannedUsersData, error } = await supabase
      .from('profiles')
      .select('id, name, full_name, email, role, banned, ban_reason, avatar_url, created_at, updated_at')
      .eq('banned', true)
    if (!error) setBannedUsers(bannedUsersData || [])
  }

  async function fetchAnalytics() {
    setAnalyticsLoading(true)

    const [
      totalUsersRes,
      totalSellersRes,
      totalBuyersRes,
      totalProductsRes,
      totalOrdersRes,
      totalReportsRes,
      totalBannedRes,
      premiumSellersRes,
      verifiedSellersRes,
      starterSellersRes,
      topProductsRes,
      userGrowthRes,
      categoriesRes,
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'seller'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'buyer'),
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('reports').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('banned', true),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('rank', 'premium'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('rank', 'verified'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('rank', 'starter'),
      supabase.from('products').select('name, views, category').order('views', { ascending: false }).limit(10),
      supabase.from('profiles').select('created_at, role').order('created_at', { ascending: true }),
      supabase.from('products').select('category'),
    ])

    setTotalUsers(totalUsersRes.count || 0)
    setTotalSellers(totalSellersRes.count || 0)
    setTotalBuyers(totalBuyersRes.count || 0)
    setTotalProducts(totalProductsRes.count || 0)
    setTotalOrders(totalOrdersRes.count || 0)
    setTotalReports(totalReportsRes.count || 0)
    setTotalBanned(totalBannedRes.count || 0)
    setPremiumSellers(premiumSellersRes.count || 0)
    setVerifiedSellers(verifiedSellersRes.count || 0)
    setStarterSellers(starterSellersRes.count || 0)
    setTopProducts(topProductsRes.data || [])
    setUserGrowth(userGrowthRes.data || [])

    const categories = categoriesRes.data || []
    const groupedCategories = categories.reduce((acc: Record<string, number>, item: any) => {
      const key = item.category || 'Uncategorized'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})
    setCategoryBreakdown(Object.entries(groupedCategories).map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count))
    setAnalyticsLoading(false)
    setAnalyticsLoaded(true)
  }

  useEffect(() => {
    if (activeTab === 'analytics' && !analyticsLoaded) {
      fetchAnalytics()
    }
  }, [activeTab, analyticsLoaded])

  async function fetchAll() {
    setLoading(true)

    // Fetch ALL rank requests with seller profile info
    const { data: requests } = await supabase
      .from('rank_requests')
      .select(`
        id, 
        seller_id, 
        rank, 
        status, 
        screenshot_url, 
        full_name, 
        shop_name,
        phone_number,
        plan_type,
        created_at,
        profiles!inner (
          id,
          name,
          full_name,
          email,
          avatar_url,
          shop_slug,
          rank,
          tier_expires_at
        )
      `)
      .order('created_at', { ascending: false })
    setRankRequests(requests || [])

    // Fetch ALL users (buyers + sellers)
    const { data: allUsers } = await supabase
      .from('profiles')
      .select('id, name, full_name, email, role, rank, avatar_url, created_at, updated_at, banned, ban_reason, is_admin')
      .order('created_at', { ascending: false })
    setAllUsers(allUsers || [])
    await fetchBannedUsers()

    // Fetch ONLY sellers
    const { data: sellersData } = await supabase
      .from('profiles')
      .select('id, name, full_name, email, role, rank, avatar_url, created_at, banned, phone, shop_slug, tier, tier_expires_at, tier_forever')
      .eq('role', 'seller')
      .order('created_at', { ascending: false })
    setSellers(sellersData || [])

    // Fetch product counts per seller
    const { data: productCounts } = await supabase
      .from('products')
      .select('seller_id')
    setProductCounts(productCounts || [])

    // Fetch ALL products
    const { data: productsData } = await supabase
      .from('products')
      .select('id, name, price, category, created_at, seller_id, images, profiles(name, full_name, email)')
      .order('created_at', { ascending: false })
    setProducts(productsData || [])

    // Fetch ALL orders
    const { data: ordersData } = await supabase
      .from('orders')
      .select('id, total_price, status, created_at, profiles(name, full_name, email)')
      .order('created_at', { ascending: false })
    setOrders(ordersData || [])

    // Fetch reports
    const { data: reportsData } = await supabase.from('reports').select('id, seller_id, reporter_id, reason, details, created_at, status')
    setReports(reportsData || [])


    setLoading(false)
  }

  async function banSeller(sellerId: string, banned: boolean) {
    if (banned) {
      const reason = prompt('Enter ban reason (optional):') || 'Violation of NestKH Terms of Service'
      try {
        await adminAction({ action: 'banUser', userId: sellerId, reason })
        setAllUsers(prev => prev.map(user => user.id === sellerId ? { ...user, banned: true, ban_reason: reason } : user))
        setSellers(prev => prev.map(user => user.id === sellerId ? { ...user, banned: true } : user))
        await fetchBannedUsers()
        alert('Seller banned successfully!')
      } catch (e: any) {
        alert('Failed to ban seller: ' + (e.message || 'Unknown error'))
      }
    } else {
      const confirmed = confirm('Unban this user? They will regain full access.')
      if (!confirmed) return
      try {
        await adminAction({ action: 'unbanUser', userId: sellerId })
        setAllUsers(prev => prev.map(user => user.id === sellerId ? { ...user, banned: false, ban_reason: null } : user))
        setSellers(prev => prev.map(user => user.id === sellerId ? { ...user, banned: false } : user))
        await fetchBannedUsers()
        alert('User unbanned successfully!')
      } catch (e: any) {
        alert('Failed to unban seller: ' + (e.message || 'Unknown error'))
      }
    }
  }

  async function banUser(userId: string) {
    if (!confirm('Are you sure you want to ban this user? This action cannot be undone.')) return
    const reason = prompt('Enter ban reason (optional):') || 'Violation of NestKH Terms of Service'
    try {
      await adminAction({ action: 'banUser', userId, reason })
      setAllUsers(prev => prev.map(user => user.id === userId ? { ...user, banned: true, ban_reason: reason } : user))
      await fetchBannedUsers()
      alert('User banned successfully!')
    } catch (e: any) {
      alert('Failed to ban user: ' + (e.message || 'Unknown error'))
    }
  }

  async function deleteProduct(productId: string) {
    if (!confirm('Delete this product?')) return
    await supabase.from('products').delete().eq('id', productId)
    fetchAll()
  }

  const filteredProducts = products.filter(product => {
    const searchLower = productSearch.toLowerCase()
    return (
      product.name?.toLowerCase().includes(searchLower) ||
      product.seller_name?.toLowerCase().includes(searchLower) ||
      product.category?.toLowerCase().includes(searchLower) ||
      product.seller_email?.toLowerCase().includes(searchLower) ||
      product.profiles?.name?.toLowerCase().includes(searchLower) ||
      product.profiles?.full_name?.toLowerCase().includes(searchLower) ||
      product.profiles?.email?.toLowerCase().includes(searchLower)
    )
  })

  if (!isAdmin) return (
    <div style={{ minHeight: '100vh', background: '#080a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.4)' }}>Access denied.</p>
    </div>
  )

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#080a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)' }}>
      Loading Admin Panel...
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

  const tabs = [
    { id: 'analytics', label: 'Analytics', count: totalUsers },
    { id: 'monthly-ranks', label: 'Monthly Ranks', count: rankRequests.filter(r => r.plan_type === 'monthly' || r.plan_type === null || r.plan_type === undefined).length },
    { id: 'forever-ranks', label: 'Forever Ranks', count: rankRequests.filter(r => r.plan_type === 'forever').length },
    { id: 'subscriptions', label: 'Subscriptions', count: sellers.filter(s => s.role === 'seller').length },
    { id: 'users', label: 'Users', count: allUsers.length },
    { id: 'sellers', label: 'Sellers', count: sellers.length },
    { id: 'banned-users', label: 'Banned Users', count: bannedUsers.length },
    { id: 'products', label: 'Products', count: products.length },
    { id: 'orders', label: 'Orders', count: orders.length },
    { id: 'reports', label: 'Reports', count: reports.length },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#080a0f', paddingTop: '40px', paddingBottom: '60px', position: 'relative' }}>
      
      {/* Orbs */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-150px', left: '-100px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,78,100,0.4) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '-150px', right: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,201,126,0.25) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px 0' }}>NESTKH</p>
            <h1 style={{ color: 'white', fontSize: '32px', fontWeight: '900', margin: 0 }}><Settings size={24} style={{ marginRight: '8px' }} />Admin Panel</h1>
          </div>
          <Link href="/">
            <button style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', borderRadius: '9999px', padding: '10px 20px', cursor: 'pointer', fontSize: '14px' }}>
              ← Back to Site
            </button>
          </Link>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: '10px 20px', borderRadius: '9999px', fontSize: '14px',
              fontWeight: '600', cursor: 'pointer', border: '1px solid',
              transition: 'all 0.2s',
              background: activeTab === tab.id ? 'rgba(0,78,100,0.3)' : 'rgba(255,255,255,0.06)',
              borderColor: activeTab === tab.id ? 'rgba(0,78,100,0.6)' : 'rgba(255,255,255,0.12)',
              color: activeTab === tab.id ? '#4DB8CC' : 'rgba(255,255,255,0.6)',
            }}>
              {tab.label} {tab.count > 0 && <span style={{ background: 'rgba(232,201,126,0.3)', color: '#E8C97E', borderRadius: '9999px', padding: '2px 8px', fontSize: '11px', marginLeft: '6px' }}>{tab.count}</span>}
            </button>
          ))}
        </div>

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div style={{ color: 'white' }}>
            <style>{`
              @keyframes fadeInUp {
                from { 
                  opacity: 0; 
                  transform: translateY(20px); 
                }
                to { 
                  opacity: 1; 
                  transform: translateY(0); 
                }
              }
              .analytics-section { animation: fadeInUp 0.5s ease forwards; }
              .analytics-section-1 { animation-delay: 0.1s; }
              .analytics-section-2 { animation-delay: 0.2s; }
              .analytics-section-3 { animation-delay: 0.3s; }
              .analytics-section-4 { animation-delay: 0.4s; }
              .analytics-section-5 { animation-delay: 0.5s; }
            `}</style>

            {/* SECTION 1: PLATFORM OVERVIEW */}
            <div className="analytics-section analytics-section-1" style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📊 Platform Overview
              </h2>
              <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                {[
                  { label: 'Total Users', value: totalUsers, color: '#3b82f6', icon: '👥' },
                  { label: 'Total Products', value: totalProducts, color: '#8b5cf6', icon: '📦' },
                  { label: 'Total Orders', value: totalOrders, color: '#f59e0b', icon: '🛒' },
                  { label: 'Total Reports', value: totalReports, color: '#f97316', icon: '⚠️' },
                ].map(card => {
                  const animatedValue = useCountUp(card.value, 1500)
                  return (
                    <div key={card.label} style={{
                      background: '#1a2332',
                      border: '1px solid #1e3a5f',
                      borderRadius: '12px',
                      padding: '20px',
                      borderLeft: `4px solid ${card.color}`,
                      minHeight: '140px',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <div style={{ fontSize: '20px', marginBottom: '12px' }}>{card.icon}</div>
                      <p style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 8px', color: 'white' }}>
                        {animatedValue}
                      </p>
                      <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                        {card.label}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {analyticsLoading ? (
              <div style={{ background: '#1a2332', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.8)' }}>
                Loading analytics data...
              </div>
            ) : (
              <>
                {/* SECTION 2: USERS & COMMUNITY */}
                <div className="analytics-section analytics-section-2" style={{ marginBottom: '40px' }}>
                  <div style={{ borderTop: '1px solid #1e3a5f', paddingTop: '20px', marginBottom: '20px' }} />
                  <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    👥 Users & Community
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    {/* Left: Stat Cards */}
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {[
                        { label: 'Total Buyers', value: totalBuyers, color: '#10b981', icon: '🛍️' },
                        { label: 'Total Sellers', value: totalSellers, color: '#0d9488', icon: '🏪' },
                        { label: 'Banned Users', value: totalBanned, color: '#ef4444', icon: '🚫' },
                      ].map(card => {
                        const animatedValue = useCountUp(card.value, 1500)
                        return (
                          <div key={card.label} style={{
                            background: '#1a2332',
                            border: '1px solid #1e3a5f',
                            borderRadius: '12px',
                            padding: '16px',
                            borderLeft: `4px solid ${card.color}`,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div>
                              <p style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 4px', color: 'white' }}>
                                {animatedValue}
                              </p>
                              <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
                                {card.label}
                              </p>
                            </div>
                            <div style={{ fontSize: '24px' }}>{card.icon}</div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Right: Pie Chart */}
                    <div style={{ background: '#1a2332', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '20px' }}>
                      <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '600', color: 'rgba(255,255,255,0.8)' }}>
                        Buyers vs Sellers
                      </h3>
                      <div style={{ width: '100%', height: '220px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Buyers', value: totalBuyers, fill: '#10b981' },
                                { name: 'Sellers', value: totalSellers, fill: '#0d9488' },
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={80}
                              paddingAngle={2}
                              dataKey="value"
                              label={({ name, value, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                            >
                              <Cell fill="#10b981" />
                              <Cell fill="#0d9488" />
                            </Pie>
                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #1e3a5f', color: 'white' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: SELLERS & RANKS */}
                <div className="analytics-section analytics-section-3" style={{ marginBottom: '40px' }}>
                  <div style={{ borderTop: '1px solid #1e3a5f', paddingTop: '20px', marginBottom: '20px' }} />
                  <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🏆 Sellers & Ranks
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    {/* Left: Stat Cards */}
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {[
                        { label: 'Free Sellers', value: Math.max(totalSellers - starterSellers - verifiedSellers - premiumSellers, 0), color: '#6b7280', icon: '⭐' },
                        { label: 'Starter Sellers', value: starterSellers, color: '#3b82f6', icon: '🌟' },
                        { label: 'Verified Sellers', value: verifiedSellers, color: '#0d9488', icon: '✅' },
                        { label: 'Premium Sellers', value: premiumSellers, color: '#f59e0b', icon: '👑' },
                      ].map(card => {
                        const animatedValue = useCountUp(card.value, 1500)
                        return (
                          <div key={card.label} style={{
                            background: '#1a2332',
                            border: '1px solid #1e3a5f',
                            borderRadius: '12px',
                            padding: '16px',
                            borderLeft: `4px solid ${card.color}`,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div>
                              <p style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 4px', color: 'white' }}>
                                {animatedValue}
                              </p>
                              <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
                                {card.label}
                              </p>
                            </div>
                            <div style={{ fontSize: '20px' }}>{card.icon}</div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Right: Bar Chart */}
                    <div style={{ background: '#1a2332', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '20px' }}>
                      <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '600', color: 'rgba(255,255,255,0.8)' }}>
                        Rank Distribution
                      </h3>
                      <div style={{ width: '100%', height: '280px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { name: 'Free', value: Math.max(totalSellers - starterSellers - verifiedSellers - premiumSellers, 0), fill: '#6b7280' },
                            { name: 'Starter', value: starterSellers, fill: '#3b82f6' },
                            { name: 'Verified', value: verifiedSellers, fill: '#0d9488' },
                            { name: 'Premium', value: premiumSellers, fill: '#f59e0b' },
                          ]}>
                            <CartesianGrid stroke="#1e3a5f" />
                            <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                            <YAxis stroke="rgba(255,255,255,0.5)" allowDecimals={false} />
                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #1e3a5f', color: 'white' }} />
                            <Bar dataKey="value" fill="#0d9488" radius={[8, 8, 0, 0]}>
                              {[
                                { value: Math.max(totalSellers - starterSellers - verifiedSellers - premiumSellers, 0), fill: '#6b7280' },
                                { value: starterSellers, fill: '#3b82f6' },
                                { value: verifiedSellers, fill: '#0d9488' },
                                { value: premiumSellers, fill: '#f59e0b' },
                              ].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 4: PRODUCTS */}
                <div className="analytics-section analytics-section-4" style={{ marginBottom: '40px' }}>
                  <div style={{ borderTop: '1px solid #1e3a5f', paddingTop: '20px', marginBottom: '20px' }} />
                  <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    📦 Products
                  </h2>
                  
                  {/* Stat Cards */}
                  <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: '24px' }}>
                    {[
                      { label: 'Total Products', value: totalProducts, color: '#8b5cf6', icon: '📦' },
                      { label: 'Total Views', value: topProducts.reduce((sum: number, p: any) => sum + (p.views || 0), 0), color: '#3b82f6', icon: '👁️' },
                    ].map(card => {
                      const animatedValue = useCountUp(card.value, 1500)
                      return (
                        <div key={card.label} style={{
                          background: '#1a2332',
                          border: '1px solid #1e3a5f',
                          borderRadius: '12px',
                          padding: '20px',
                          borderLeft: `4px solid ${card.color}`,
                        }}>
                          <p style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 8px', color: 'white' }}>
                            {animatedValue}
                          </p>
                          <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                            {card.label}
                          </p>
                        </div>
                      )
                    })}
                  </div>

                  {/* Charts Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    {/* Top Products Chart */}
                    <div style={{ background: '#1a2332', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '20px' }}>
                      <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '600', color: 'rgba(255,255,255,0.8)' }}>
                        Top 10 Products by Views
                      </h3>
                      <div style={{ width: '100%', height: '280px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={topProducts.slice(0, 10).map((item: any) => ({
                              name: item.name?.length > 12 ? `${item.name.slice(0, 12)}...` : item.name || 'Unknown',
                              views: item.views || 0,
                            }))}
                            layout="vertical"
                            margin={{ left: 80, right: 20 }}
                          >
                            <CartesianGrid stroke="#1e3a5f" />
                            <XAxis type="number" stroke="rgba(255,255,255,0.5)" />
                            <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.5)" width={75} tick={{ fontSize: 11 }} />
                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #1e3a5f', color: 'white' }} />
                            <Bar dataKey="views" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Category Breakdown */}
                    <div style={{ background: '#1a2332', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '20px' }}>
                      <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: '600', color: 'rgba(255,255,255,0.8)' }}>
                        Products by Category
                      </h3>
                      <div style={{ width: '100%', height: '280px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryBreakdown.slice(0, 6)}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              dataKey="count"
                              label={({ name, percent }) => `${(name ?? '').slice(0, 10)} ${((percent ?? 0) * 100).toFixed(0)}%`}
                            >
                              {categoryBreakdown.slice(0, 6).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={[
                                  '#8b5cf6', '#3b82f6', '#0d9488', '#10b981', '#f59e0b', '#ef4444'
                                ][index % 6]} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #1e3a5f', color: 'white' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 5: GROWTH OVER TIME */}
                <div className="analytics-section analytics-section-5">
                  <div style={{ borderTop: '1px solid #1e3a5f', paddingTop: '20px', marginBottom: '20px' }} />
                  <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    📈 Growth Over Time
                  </h2>
                  <div style={{ background: '#1a2332', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '20px' }}>
                    <div style={{ width: '100%', height: '320px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={growthData}>
                          <defs>
                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0d9488" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#0d9488" stopOpacity={0.1} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="#1e3a5f" />
                          <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                          <YAxis stroke="rgba(255,255,255,0.5)" allowDecimals={false} />
                          <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #1e3a5f', color: 'white' }} />
                          <Area
                            type="monotone"
                            dataKey="users"
                            stroke="#0d9488"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorUsers)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* MONTHLY RANKS TAB */}
        {activeTab === 'monthly-ranks' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '20px' }}>Monthly Rank Requests</h2>
            {rankRequests.filter(r => r.plan_type === 'monthly' || r.plan_type === null || r.plan_type === undefined).length === 0 ? (
              <p style={{ color: '#6b7280' }}>No monthly rank requests yet.</p>
            ) : (
              rankRequests.filter(r => r.plan_type === 'monthly' || r.plan_type === null || r.plan_type === undefined).map((req: any) => (
                <div key={req.id} style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <p style={{ fontWeight: '700', color: '#111827', fontSize: '16px', margin: '0 0 4px 0' }}>{req.full_name || 'Unknown'}</p>
                      <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 4px 0' }}>{req.shop_name || 'No shop name'}</p>
                      {req.phone_number && (
                        <p style={{ color: '#6b7280', fontSize: '12px', margin: '0 0 4px 0' }}>📞 {req.phone_number}</p>
                      )}
                      <p style={{ color: '#6b7280', fontSize: '12px', margin: '0' }}>Tier {req.rank} — {req.rank === 1 ? 'Starter' : req.rank === 2 ? 'Verified' : 'Premium'}</p>
                    </div>
                    <span style={{ backgroundColor: req.status === 'pending' ? '#fef3c7' : req.status === 'approved' ? '#d1fae5' : '#fee2e2', color: req.status === 'pending' ? '#92400e' : req.status === 'approved' ? '#065f46' : '#991b1b', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                      {req.status}
                    </span>
                  </div>
                  {req.screenshot_url && (
                    <a href={req.screenshot_url} target="_blank" rel="noopener noreferrer">
                      <img src={req.screenshot_url} alt="Payment proof" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px', cursor: 'pointer' }} />
                    </a>
                  )}
                  {req.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => handleApprove(req)} style={{ backgroundColor: '#004E64', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: '600', cursor: 'pointer' }}>✅ Approve</button>
                      <button onClick={() => handleReject(req)} style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: '600', cursor: 'pointer' }}>✗ Reject</button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* FOREVER RANKS TAB */}
        {activeTab === 'forever-ranks' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '20px' }}>Forever Rank Requests</h2>
            {rankRequests.filter(r => r.plan_type === 'forever').length === 0 ? (
              <p style={{ color: '#6b7280' }}>No forever rank requests yet.</p>
            ) : (
              rankRequests.filter(r => r.plan_type === 'forever').map((req: any) => (
                <div key={req.id} style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <p style={{ fontWeight: '700', color: '#111827', fontSize: '16px', margin: '0 0 4px 0' }}>{req.full_name || 'Unknown'}</p>
                      <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 4px 0' }}>{req.shop_name || 'No shop name'}</p>
                      {req.phone_number && (
                        <p style={{ color: '#6b7280', fontSize: '12px', margin: '0 0 4px 0' }}>📞 {req.phone_number}</p>
                      )}
                      <p style={{ color: '#6b7280', fontSize: '12px', margin: '0' }}>Tier {req.rank} — {req.rank === 1 ? 'Starter' : req.rank === 2 ? 'Verified' : 'Premium'} (Forever)</p>
                    </div>
                    <span style={{ backgroundColor: req.status === 'pending' ? '#fef3c7' : req.status === 'approved' ? '#d1fae5' : '#fee2e2', color: req.status === 'pending' ? '#92400e' : req.status === 'approved' ? '#065f46' : '#991b1b', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                      {req.status}
                    </span>
                  </div>
                  {req.screenshot_url && (
                    <a href={req.screenshot_url} target="_blank" rel="noopener noreferrer">
                      <img src={req.screenshot_url} alt="Payment proof" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px', cursor: 'pointer' }} />
                    </a>
                  )}
                  {req.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => handleApprove(req)} style={{ backgroundColor: '#004E64', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: '600', cursor: 'pointer' }}>✅ Approve</button>
                      <button onClick={() => handleReject(req)} style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: '600', cursor: 'pointer' }}>✗ Reject</button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* SUBSCRIPTIONS TAB */}
        {activeTab === 'subscriptions' && (
          <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '24px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#111827', fontWeight: '800', fontSize: '20px', marginBottom: '20px' }}>Seller Subscriptions</h2>
            
            {/* Search Bar */}
            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                value={subscriptionSearch}
                onChange={(e) => setSubscriptionSearch(e.target.value)}
                placeholder="Search by name or shop name..."
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  padding: '12px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '14px',
                  color: '#111827',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {sellers.filter(s => s.role === 'seller').length === 0 ? (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px' }}>No sellers found</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(() => {
                  // Filter and sort sellers
                  const filteredSellers = sellers
                    .filter(seller => seller.role === 'seller')
                    .filter(seller => {
                      if (!subscriptionSearch) return true;
                      const searchLower = subscriptionSearch.toLowerCase();
                      return (
                        (seller.name && seller.name.toLowerCase().includes(searchLower)) ||
                        (seller.full_name && seller.full_name.toLowerCase().includes(searchLower)) ||
                        (seller.shop_slug && seller.shop_slug.toLowerCase().includes(searchLower)) ||
                        (seller.phone && seller.phone.toLowerCase().includes(searchLower))
                      );
                    });

                  // Sort: expired first, then by days remaining ascending
                  const sortedSellers = [...filteredSellers].sort((a, b) => {
                    const getDaysRemaining = (seller: { tier: number; tier_expires_at: string | null }) => {
                      if (!seller.tier_expires_at || seller.tier === 0) return Infinity;
                      const daysLeft = Math.ceil((new Date(seller.tier_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                      return daysLeft;
                    };

                    const aExpired = a.tier > 0 && a.tier_expires_at && new Date(a.tier_expires_at) < new Date();
                    const bExpired = b.tier > 0 && b.tier_expires_at && new Date(b.tier_expires_at) < new Date();

                    // Expired sellers first
                    if (aExpired && !bExpired) return -1;
                    if (!aExpired && bExpired) return 1;

                    // Then by days remaining (closest to expiry first)
                    const aDays = getDaysRemaining(a);
                    const bDays = getDaysRemaining(b);
                    return aDays - bDays;
                  });

                  return sortedSellers.map(seller => {
                    // Calculate days remaining and status
                    const getSubscriptionStatus = (seller: { tier: number; tier_expires_at: string | null }) => {
                      if (seller.tier === 0) {
                        return { days: null, status: 'free', color: '#6b7280', text: 'Free' };
                      }
                      
                      if (!seller.tier_expires_at) {
                        return { days: null, status: 'expired', color: '#dc2626', text: 'EXPIRED' };
                      }

                      const daysLeft = Math.ceil((new Date(seller.tier_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                      
                      if (daysLeft < 0) {
                        return { days: daysLeft, status: 'expired', color: '#dc2626', text: 'EXPIRED' };
                      }
                      
                      if (daysLeft <= 7) {
                        return { days: daysLeft, status: 'urgent', color: '#dc2626', text: `${daysLeft} days` };
                      }
                      
                      if (daysLeft <= 14) {
                        return { days: daysLeft, status: 'warning', color: '#f59e0b', text: `${daysLeft} days` };
                      }
                      
                      return { days: daysLeft, status: 'active', color: '#16a34a', text: `${daysLeft} days` };
                    };

                    const subscriptionStatus = getSubscriptionStatus(seller);
                    const tierNames: Record<number, string> = { 0: 'Free', 1: 'Starter', 2: 'Verified', 3: 'Premium' };
                    const tierName = tierNames[seller.tier as number] || 'Unknown';

                    return (
                      <div key={seller.id} style={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '16px',
                        padding: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        transition: 'all 0.2s'
                      }}>
                        {/* Avatar */}
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: '#f3f4f6',
                          border: '2px solid #e5e7eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          flexShrink: 0
                        }}>
                          {seller.avatar_url ? (
                            <img 
                              src={seller.avatar_url} 
                              alt="Seller Avatar"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <span style={{ color: '#6b7280', fontWeight: '600', fontSize: '14px' }}>
                              {(seller.name || seller.full_name || 'S').charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* Seller Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                            <h3 style={{ color: '#111827', fontWeight: '600', fontSize: '16px', margin: 0 }}>
                              {seller.name || seller.full_name || 'Unknown Seller'}
                            </h3>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              backgroundColor: seller.tier === 3 ? '#fef3c7' : 
                                             seller.tier === 2 ? '#dbeafe' : 
                                             seller.tier === 1 ? '#f3f4f6' : '#f9fafb',
                              color: seller.tier === 3 ? '#92400e' : 
                                     seller.tier === 2 ? '#1e40af' : 
                                     seller.tier === 1 ? '#374151' : '#6b7280',
                              border: `1px solid ${
                                seller.tier === 3 ? '#f59e0b' : 
                                seller.tier === 2 ? '#3b82f6' : 
                                seller.tier === 1 ? '#d1d5db' : '#e5e7eb'
                              }`
                            }}>
                              {tierName}
                            </span>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '4px' }}>
                            <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>
                              {seller.email || 'No email'}
                            </p>
                            {seller.phone && (
                              <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>
                                📞 <a href={`tel:${seller.phone}`} style={{ color: '#4DB8CC', textDecoration: 'none' }}>{seller.phone}</a>
                              </p>
                            )}
                            {seller.shop_slug && (
                              <p style={{ color: '#004E64', fontSize: '13px', margin: 0 }}>
                                🏪 {seller.shop_slug}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Expiry Info */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          {/* Approved On Date */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: '#6b7280', fontSize: '11px', fontWeight: '500' }}>📅 Approved:</span>
                            <span style={{ color: '#111827', fontSize: '12px', fontWeight: '600' }}>
                              {(() => {
                                if (seller.tier_expires_at) {
                                  const approvedOn = new Date(new Date(seller.tier_expires_at).getTime() - 30 * 24 * 60 * 60 * 1000);
                                  return approvedOn.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                } else if (seller.created_at) {
                                  return new Date(seller.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                }
                                return 'N/A';
                              })()}
                            </span>
                          </div>

                          {/* Expires On Date */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: '#6b7280', fontSize: '11px', fontWeight: '500' }}>⏰ Expires:</span>
                            <span style={{ color: '#111827', fontSize: '12px', fontWeight: '600' }}>
                              {seller.tier_forever === true ? (
                                <span style={{ color: '#f59e0b', fontWeight: '700' }}>♾️ Forever</span>
                              ) : seller.tier_expires_at ? 
                                new Date(seller.tier_expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 
                                'Never'
                              }
                            </span>
                          </div>

                          {/* Status Badge */}
                          <span style={{
                            padding: '6px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            backgroundColor: subscriptionStatus.status === 'expired' ? '#fee2e2' : 
                                           subscriptionStatus.status === 'urgent' ? '#fee2e2' :
                                           subscriptionStatus.status === 'warning' ? '#fef3c7' :
                                           subscriptionStatus.status === 'active' ? '#d1fae5' : '#f3f4f6',
                            color: subscriptionStatus.color,
                            border: `1px solid ${
                              subscriptionStatus.status === 'expired' ? '#ef4444' : 
                              subscriptionStatus.status === 'urgent' ? '#ef4444' :
                              subscriptionStatus.status === 'warning' ? '#f59e0b' :
                              subscriptionStatus.status === 'active' ? '#34d399' : '#d1d5db'
                            }`
                          }}>
                            {subscriptionStatus.text}
                          </span>
                        </div>
                        {/* Assign Rank UI */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', marginLeft: '12px' }}>
                          {!assignState[seller.id]?.open ? (
                            <button onClick={() => openAssign(seller)} style={{ background: 'rgba(0,78,100,0.12)', border: '1px solid rgba(0,78,100,0.2)', color: '#4DB8CC', borderRadius: '12px', padding: '8px 12px', cursor: 'pointer', fontWeight: '700' }}>Assign Rank</button>
                          ) : (
                            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '12px', width: '320px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
                              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                <select value={assignState[seller.id]?.selectedTier ?? 0} onChange={(e) => setAssignField(seller.id, 'selectedTier', Number(e.target.value))} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                                  <option value={0}>Free</option>
                                  <option value={1}>Starter</option>
                                  <option value={2}>Verified</option>
                                  <option value={3}>Premium</option>
                                </select>
                                <select value={assignState[seller.id]?.planType ?? 'forever'} onChange={(e) => setAssignField(seller.id, 'planType', e.target.value)} style={{ width: '130px', padding: '8px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                                  <option value={'forever'}>Forever</option>
                                  <option value={'custom'}>Custom expiry</option>
                                </select>
                              </div>
                              {assignState[seller.id]?.planType === 'custom' && (
                                <div style={{ marginBottom: '8px' }}>
                                  <input type="date" value={assignState[seller.id]?.expiry || ''} onChange={(e) => setAssignField(seller.id, 'expiry', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                                </div>
                              )}
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button onClick={() => { closeAssign(seller.id) }} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)', background: 'transparent', cursor: 'pointer' }}>Cancel</button>
                                <button onClick={() => assignRankToSeller(seller)} disabled={assignState[seller.id]?.loading} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', background: '#004E64', color: 'white', fontWeight: '700', cursor: 'pointer' }}>{assignState[seller.id]?.loading ? 'Saving...' : 'Confirm'}</button>
                              </div>
                              {assignState[seller.id]?.message && (
                                <div style={{ marginTop: '8px', color: assignState[seller.id].message.type === 'success' ? '#065f46' : '#991b1b', fontWeight: 700 }}>{assignState[seller.id].message.text}</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>
        )}

        {/* ALL USERS TAB */}
        {activeTab === 'users' && (
          <div style={{ ...glassCard, padding: '24px' }}>
            <h2 style={{ color: 'white', fontWeight: '800', fontSize: '20px', marginBottom: '8px' }}>All Users</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '20px' }}>
              Total: {allUsers.length} users
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {allUsers.map(user => (
                <div key={user.id} style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '14px',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '50%',
                      background: user.role === 'admin' 
                        ? 'rgba(232,201,126,0.3)' 
                        : user.role === 'seller' 
                        ? 'rgba(0,78,100,0.4)' 
                        : 'rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center',
                      color: user.role === 'admin' ? '#E8C97E' : user.role === 'seller' ? '#4DB8CC' : 'white',
                      fontWeight: '700', fontSize: '15px',
                      overflow: 'hidden', flexShrink: 0
                    }}>
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        (user.name || user.full_name || user.email || 'U').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <p style={{ color: 'white', fontWeight: '600', margin: 0, fontSize: '14px' }}>
                          {user.name || user.full_name || 'No name'}
                        </p>
                        {user.banned && (
                          <span style={{ background: 'rgba(255,80,80,0.2)', color: '#f87171', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '9999px' }}>BANNED</span>
                        )}
                      </div>
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '2px 0 0 0' }}>
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: '700',
                      background: user.role === 'admin' 
                        ? 'rgba(232,201,126,0.2)' 
                        : user.role === 'seller' 
                        ? 'rgba(0,78,100,0.2)' 
                        : 'rgba(255,255,255,0.08)',
                      color: user.role === 'admin' 
                        ? '#E8C97E' 
                        : user.role === 'seller' 
                        ? '#4DB8CC' 
                        : 'rgba(255,255,255,0.5)',
                      border: `1px solid ${user.role === 'admin' 
                        ? 'rgba(232,201,126,0.3)' 
                        : user.role === 'seller' 
                        ? 'rgba(0,78,100,0.3)' 
                        : 'rgba(255,255,255,0.1)'}`
                    }}>
                      {user.role === 'admin' ? <><Settings size={14} /> Admin</> : user.role === 'seller' ? <><Store size={14} /> Seller</> : <><User size={14} /> Buyer</>}
                    </span>

                    {user.rank && user.rank !== 'none' && (
                      <span style={{
                        padding: '3px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: '700',
                        background: user.rank === 'premium' ? 'rgba(232,201,126,0.2)' : user.rank === 'verified' ? 'rgba(0,78,100,0.2)' : 'rgba(59,130,246,0.2)',
                        color: user.rank === 'premium' ? '#E8C97E' : user.rank === 'verified' ? '#4DB8CC' : '#93c5fd',
                      }}>
                        {user.rank === 'premium' ? <><Star size={12} /> Premium</> : user.rank === 'verified' ? <><Check size={12} /> Verified</> : <><Medal size={12} /> Starter</>}
                      </span>
                    )}
                  </div>

                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>
                    Joined {new Date(user.created_at).toLocaleDateString()}
                  </p>

                  {user.role !== 'admin' && (
                    <button
                      onClick={() => banSeller(user.id, !user.banned)}
                      style={{
                        background: user.banned ? 'rgba(0,78,100,0.3)' : 'rgba(255,80,80,0.15)',
                        border: `1px solid ${user.banned ? 'rgba(0,78,100,0.5)' : 'rgba(255,80,80,0.3)'}`,
                        color: user.banned ? '#4DB8CC' : '#f87171',
                        borderRadius: '9999px', padding: '6px 14px',
                        cursor: 'pointer', fontSize: '12px', fontWeight: '600'
                      }}
                    >
                      {user.banned ? <><Check size={12} /> Unban</> : <><Ban size={12} /> Ban</>}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SELLERS TAB */}
        {activeTab === 'sellers' && (
          <div style={{ ...glassCard, padding: '24px' }}>
            <h2 style={{ color: 'white', fontWeight: '800', fontSize: '20px', marginBottom: '20px' }}>All Sellers</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sellers.map(seller => (
                <div key={seller.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,78,100,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4DB8CC', fontWeight: '700' }}>
                      {(seller.name || seller.full_name || 'S').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <p style={{ color: 'white', fontWeight: '600', margin: 0 }}>{seller.name || seller.full_name}</p>
                        {seller.banned && <span style={{ background: 'rgba(255,80,80,0.2)', color: '#f87171', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '9999px', border: '1px solid rgba(255,80,80,0.3)' }}>BANNED</span>}
                      </div>
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '2px 0 0 0' }}>{seller.email}</p>
                      {seller.phone && (
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '2px 0 0 0' }}>
                          📞 <a href={`tel:${seller.phone}`} style={{ color: '#4DB8CC', textDecoration: 'none' }}>{seller.phone}</a>
                        </p>
                      )}
                    </div>
                  </div>
                  {seller.rank && seller.rank !== 'none' && (
                    <span style={{ padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '700', background: seller.rank === 'premium' ? 'rgba(232,201,126,0.2)' : seller.rank === 'verified' ? 'rgba(0,78,100,0.2)' : 'rgba(59,130,246,0.2)', color: seller.rank === 'premium' ? '#E8C97E' : seller.rank === 'verified' ? '#4DB8CC' : '#93c5fd' }}>
                      {seller.rank === 'premium' ? <><Star size={12} /> Premium</> : seller.rank === 'verified' ? <><Check size={12} /> Verified</> : <><Medal size={12} /> Starter</>}
                    </span>
                  )}
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{productCounts.filter(p => p.seller_id === seller.id).length} products</p>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div>
                      {!assignState[seller.id]?.open ? (
                        <button onClick={() => openAssign(seller)} style={{ background: 'rgba(0,78,100,0.12)', border: '1px solid rgba(0,78,100,0.2)', color: '#4DB8CC', borderRadius: '12px', padding: '8px 12px', cursor: 'pointer', fontWeight: '700' }}>Assign Rank</button>
                      ) : (
                        <div style={{ background: '#0b1220', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                            <select value={assignState[seller.id]?.selectedTier ?? 0} onChange={(e) => setAssignField(seller.id, 'selectedTier', Number(e.target.value))} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #1f2937', background: '#0b1220', color: 'white' }}>
                              <option value={0}>Free</option>
                              <option value={1}>Starter</option>
                              <option value={2}>Verified</option>
                              <option value={3}>Premium</option>
                            </select>
                            <select value={assignState[seller.id]?.planType ?? 'forever'} onChange={(e) => setAssignField(seller.id, 'planType', e.target.value)} style={{ width: '140px', padding: '8px', borderRadius: '8px', border: '1px solid #1f2937', background: '#0b1220', color: 'white' }}>
                              <option value={'forever'}>Forever</option>
                              <option value={'custom'}>Custom expiry</option>
                            </select>
                          </div>
                          {assignState[seller.id]?.planType === 'custom' && (
                            <div style={{ marginBottom: '8px' }}>
                              <input type="date" value={assignState[seller.id]?.expiry || ''} onChange={(e) => setAssignField(seller.id, 'expiry', e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #1f2937', background: '#0b1220', color: 'white' }} />
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button onClick={() => closeAssign(seller.id)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', background: 'transparent', color: 'white', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={() => assignRankToSeller(seller)} disabled={assignState[seller.id]?.loading} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', background: '#004E64', color: 'white', fontWeight: '700', cursor: 'pointer' }}>{assignState[seller.id]?.loading ? 'Saving...' : 'Confirm'}</button>
                          </div>
                          {assignState[seller.id]?.message && (
                            <div style={{ marginTop: '8px', color: assignState[seller.id].message.type === 'success' ? '#10B981' : '#f87171', fontWeight: 700 }}>{assignState[seller.id].message.text}</div>
                          )}
                        </div>
                      )}
                    </div>
                    <button onClick={() => banSeller(seller.id, !seller.banned)} style={{
                    background: seller.banned ? 'rgba(0,78,100,0.3)' : 'rgba(255,80,80,0.15)',
                    border: `1px solid ${seller.banned ? 'rgba(0,78,100,0.5)' : 'rgba(255,80,80,0.3)'}`,
                    color: seller.banned ? '#4DB8CC' : '#f87171',
                    borderRadius: '9999px', padding: '8px 16px', cursor: 'pointer', fontSize: '13px', fontWeight: '600'
                  }}>
                    {seller.banned ? <><Check size={12} /> Unban</> : <><Ban size={12} /> Ban</>}
                  </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BANNED USERS TAB */}
        {activeTab === 'banned-users' && (
          <div style={{ ...glassCard, padding: '24px' }}>
            <h2 style={{ color: 'white', fontWeight: '800', fontSize: '20px', marginBottom: '8px' }}>Banned Users</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '20px' }}>
              Showing {bannedUsers.length} banned user{bannedUsers.length === 1 ? '' : 's'}
            </p>
            {bannedUsers.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.4)', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px' }}>
                No banned users found.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {bannedUsers.map(user => (
                  <div key={user.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '18px' }}>
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.name || user.full_name || 'User'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          (user.name || user.full_name || user.email || 'U').charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p style={{ color: 'white', fontWeight: '700', margin: 0, fontSize: '15px' }}>{user.name || user.full_name || 'No name'}</p>
                        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', margin: '4px 0 0' }}>{user.email}</p>
                        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', margin: '8px 0 0' }}>{user.role === 'seller' ? 'Seller' : user.role === 'admin' ? 'Admin' : 'Buyer'}</p>
                      </div>
                    </div>
                    <div style={{ flex: '1 1 220px', minWidth: '220px' }}>
                      <p style={{ color: '#f8fafc', fontSize: '13px', margin: 0, fontWeight: '600' }}>Ban reason</p>
                      <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', margin: '6px 0 0' }}>{user.ban_reason || 'Violation of NestKH Terms of Service'}</p>
                      {user.updated_at && (
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '8px 0 0' }}>Banned on {new Date(user.updated_at).toLocaleDateString()}</p>
                      )}
                    </div>
                    <button
                      onClick={async () => {
                        if (!confirm('Unban this user? They will regain full access.')) return
                        try {
                          await adminAction({ action: 'unbanUser', userId: user.id })
                          setAllUsers(prev => prev.map(item => item.id === user.id ? { ...item, banned: false, ban_reason: null } : item))
                          setSellers(prev => prev.map(item => item.id === user.id ? { ...item, banned: false } : item))
                          await fetchBannedUsers()
                          alert('User unbanned successfully!')
                        } catch (e: any) {
                          alert('Failed to unban user: ' + (e.message || 'Unknown error'))
                        }
                      }}
                      style={{
                        background: '#10B981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '9999px',
                        padding: '10px 18px',
                        cursor: 'pointer',
                        fontWeight: '700',
                        boxShadow: '0 10px 20px rgba(16,185,129,0.16)'
                      }}
                    >
                      Unban
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div style={{ ...glassCard, padding: '24px' }}>
            <h2 style={{ color: 'white', fontWeight: '800', fontSize: '20px', marginBottom: '20px' }}>All Products</h2>
            <input
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Search by product name, seller, or category..."
              style={{
                width: '100%',
                background: '#1e293b',
                border: '1px solid #334155',
                color: 'white',
                borderRadius: '8px',
                padding: '10px 16px',
                marginBottom: '18px',
                outline: 'none'
              }}
            />
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '20px' }}>
              {productSearch
                ? `Showing ${filteredProducts.length} of ${products.length} products`
                : `Total products: ${products.length}`}
            </p>
            {loading ? (
              <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '40px' }}>Loading products...</p>
            ) : filteredProducts.length === 0 && productSearch ? (
              <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '40px' }}>No products found.</p>
            ) : products.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '40px' }}>No products listed yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredProducts.map(product => (
                  <div key={product.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '10px', overflow: 'hidden', background: 'rgba(255,255,255,0.06)', flexShrink: 0 }}>
                        {product.image_url && <img src={product.image_url.startsWith('http') ? product.image_url : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/Product/${product.image_url}`} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                      <div>
                        <p style={{ color: 'white', fontWeight: '600', margin: 0 }}>{product.name}</p>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '2px 0 0 0' }}>by {product.profiles?.name || product.profiles?.full_name || 'Unknown'}</p>
                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', margin: '2px 0 0 0' }}>{product.profiles?.email || 'No email'}</p>
                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', margin: '2px 0 0 0' }}>
                          Listed {new Date(product.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span style={{ color: '#4DB8CC', fontSize: '12px', textTransform: 'uppercase' }}>{product.category}</span>
                    <span style={{ color: '#E8C97E', fontWeight: '700' }}>${product.price}</span>
                    <button onClick={() => deleteProduct(product.id)} style={{ background: 'rgba(255,80,80,0.15)', border: '1px solid rgba(255,80,80,0.3)', color: '#f87171', borderRadius: '9999px', padding: '8px 16px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
                      <X size={14} style={{ marginRight: '4px' }} />Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div style={{ ...glassCard, padding: '24px' }}>
            <h2 style={{ color: 'white', fontWeight: '800', fontSize: '20px', marginBottom: '20px' }}>All Orders</h2>
            {orders.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '40px' }}>No orders yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {orders.map(order => (
                  <div key={order.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontFamily: 'monospace' }}>#{order.id.slice(0,8)}</p>
                    <p style={{ color: 'white', fontWeight: '600' }}>{order.products?.name}</p>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>{order.profiles?.name || order.profiles?.full_name}</p>
                    <p style={{ color: '#E8C97E', fontWeight: '700' }}>${order.total_price}</p>
                    <span style={{ padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600', background: order.status === 'completed' ? 'rgba(0,200,100,0.2)' : order.status === 'shipped' ? 'rgba(59,130,246,0.2)' : 'rgba(255,80,80,0.2)', color: order.status === 'completed' ? '#4ade80' : order.status === 'shipped' ? '#93c5fd' : '#f87171' }}>
                      {order.status === 'completed' ? <><Check size={12} /> Completed</> : order.status === 'shipped' ? <><Package size={12} /> Shipped</> : <><Package size={12} /> Pending</>}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === 'reports' && (
          <div style={{ ...glassCard, padding: '24px' }}>
            <h2 style={{ color: 'white', fontWeight: '800', fontSize: '20px', marginBottom: '20px' }}>Reports</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '16px' }}>
              Total reports: {reports.length}
            </p>
            {loading ? (
              <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '40px' }}>Loading reports...</p>
            ) : reports.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '20px', textAlign: 'center', padding: '40px' }}>No reports submitted yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {reports.map(report => (
                  <div key={report.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(0,78,100,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4DB8CC', fontWeight: '700', fontSize: '16px' }}>
                          R
                        </div>
                        <div>
                          <p style={{ color: 'white', fontWeight: '700', margin: '0 0 2px 0' }}>
                            Report #{report.id}
                          </p>
                          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '2px 0 0 0' }}>
                            Reporter ID: {report.reporter_id} | Seller ID: {report.seller_id}
                          </p>
                          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>
                            {new Date(report.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <span style={{ color: '#FF6B6B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600', padding: '3px 8px', borderRadius: '4px' }}>
                        {report.reason || 'No reason'}
                      </span>
                      {report.details && (
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '8px 0 0 0' }}>
                          {report.details}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={async () => {
                          await supabase.from('reports').update({ status: 'reviewed' }).eq('id', report.id)
                          fetchAll()
                        }}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: 'none',
                          background: '#10B981',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '700'
                        }}
                      >
                        Mark Reviewed
                      </button>
                      <button
                        onClick={() => router.push(`/seller/${report.seller_id}`)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: '1px solid rgba(0,78,100,0.3)',
                          background: 'rgba(0,78,100,0.15)',
                          color: '#4DB8CC',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '700',
                          backdropFilter: 'blur(10px)',
                          WebkitBackdropFilter: 'blur(10px)'
                        }}
                      >
                        View Seller
                      </button>
                      <button
                        onClick={() => banUser(report.seller_id)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: '1px solid rgba(255,80,80,0.3)',
                          background: 'rgba(255,80,80,0.15)',
                          color: '#f87171',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '700',
                          backdropFilter: 'blur(10px)',
                          WebkitBackdropFilter: 'blur(10px)'
                        }}
                      >
                        Ban User
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
