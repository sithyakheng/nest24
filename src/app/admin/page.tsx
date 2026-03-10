'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function AdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('requests')
  const [rankRequests, setRankRequests] = useState<any[]>([])
  const [sellers, setSellers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [productCounts, setProductCounts] = useState<any[]>([])
  const [rankPayments, setRankPayments] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

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

  async function fetchAll() {
    setLoading(true)

    // Fetch ALL rank requests with seller info
    const { data: requests } = await supabase
      .from('rank_requests')
      .select('*, profiles(id, name, full_name, email, avatar_url, rank)')
      .order('created_at', { ascending: false })
    setRankRequests(requests || [])

    // Fetch ALL users (buyers + sellers)
    const { data: allUsers } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    setAllUsers(allUsers || [])

    // Fetch ONLY sellers
    const { data: sellersData } = await supabase
      .from('profiles')
      .select('*')
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
      .select('*, profiles(name, full_name, email)')
      .order('created_at', { ascending: false })
    setProducts(productsData || [])

    // Fetch ALL orders
    const { data: ordersData } = await supabase
      .from('orders')
      .select('*, products(name), profiles(name, full_name, email)')
      .order('created_at', { ascending: false })
    setOrders(ordersData || [])

    // Fetch rank payments
    const { data: paymentsData } = await supabase
      .from('rank_payments')
      .select('*, profiles(name, full_name, email), products(name)')
      .order('created_at', { ascending: false })
    setRankPayments(paymentsData || [])

    setLoading(false)
  }

  async function approveRank(requestId: string, sellerId: string, rank: string, screenshotUrl: string) {
  // Update rank request status
  const { error: requestError } = await supabase
    .from('rank_requests')
    .update({ 
      status: 'approved',
      updated_at: new Date().toISOString()
    })
    .eq('id', requestId)

  if (requestError) {
    alert('Failed to update request: ' + requestError.message)
    return
  }

  // Map rank to tier
  const rankToTierMap: Record<string, number> = {
    'starter': 1,
    'premium': 2, 
    'enterprise': 3
  }
  
  const tier = rankToTierMap[rank] || 1

  // Update seller profile rank and tier
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ 
      rank: rank,
      tier: tier
    })
    .eq('id', sellerId)

  if (profileError) {
    alert('Failed to update rank and tier: ' + profileError.message)
    return
  }

  // Delete screenshot from storage to free up space
  if (screenshotUrl) {
    try {
      const fileName = screenshotUrl.split('/Product/')[1]
      if (fileName) {
        await supabase.storage.from('Product').remove([fileName])
        console.log('Screenshot deleted from storage:', fileName)
      }
    } catch (e) {
      console.log('Could not delete screenshot:', e)
    }
  }

  alert('Rank approved!')
  fetchAll()
}

  async function rejectRank(requestId: string, screenshotUrl: string) {
    // Update rank request status
    const { error } = await supabase
      .from('rank_requests')
      .update({ 
        status: 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId)

    if (error) {
      alert('Failed to reject: ' + error.message)
      return
    }

    // Delete screenshot from storage to free up space
    if (screenshotUrl) {
      try {
        const fileName = screenshotUrl.split('/Product/')[1]
        if (fileName) {
          await supabase.storage.from('Product').remove([fileName])
          console.log('Screenshot deleted from storage:', fileName)
        }
      } catch (e) {
        console.log('Could not delete screenshot:', e)
      }
    }

    alert('Rank rejected!')
    fetchAll()
  }

  async function banSeller(sellerId: string, banned: boolean) {
    await supabase.from('profiles').update({ banned }).eq('id', sellerId)
    fetchAll()
  }

  async function deleteProduct(productId: string) {
    if (!confirm('Delete this product?')) return
    await supabase.from('products').delete().eq('id', productId)
    fetchAll()
  }

  async function approvePayment(paymentId: string, sellerId: string, rank: string) {
    await supabase.from('rank_payments').update({ status: 'approved' }).eq('id', paymentId)
    await supabase.from('profiles').update({ rank }).eq('id', sellerId)
    fetchAll()
  }

  async function rejectPayment(paymentId: string) {
    await supabase.from('rank_payments').update({ status: 'rejected' }).eq('id', paymentId)
    fetchAll()
  }

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
    { id: 'requests', label: '📋 Rank Requests', count: rankRequests.filter(r => r.status === 'pending').length },
    { id: 'users', label: '👤 All Users', count: allUsers.length },
    { id: 'sellers', label: '👥 Sellers', count: sellers.length },
    { id: 'reports', label: '🚩 Reports', count: reports.length },
    { id: 'products', label: '📦 Products', count: products.length },
    { id: 'orders', label: '🛒 Orders', count: orders.length },
    { id: 'payments', label: '💰 Payments', count: rankPayments.length },
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
            <h1 style={{ color: 'white', fontSize: '32px', fontWeight: '900', margin: 0 }}>Admin Panel ⚙️</h1>
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

        {/* RANK REQUESTS TAB */}
        {activeTab === 'requests' && (
          <div style={{ ...glassCard, padding: '24px' }}>
            <h2 style={{ color: 'white', fontWeight: '800', fontSize: '20px', marginBottom: '20px' }}>Rank Requests</h2>
            {rankRequests.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '40px' }}>No rank requests yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {rankRequests.map(req => (
                  <div key={req.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,78,100,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4DB8CC', fontWeight: '700' }}>
                        {(req.profiles?.name || req.profiles?.full_name || 'S').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ color: 'white', fontWeight: '600', margin: 0 }}>{req.profiles?.name || req.profiles?.full_name || 'Seller'}</p>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '2px 0 0 0' }}>{req.profiles?.email}</p>
                      </div>
                    </div>
                    <span style={{
                      padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '700',
                      background: req.rank === 'premium' ? 'rgba(232,201,126,0.2)' : req.rank === 'verified' ? 'rgba(0,78,100,0.2)' : 'rgba(59,130,246,0.2)',
                      color: req.rank === 'premium' ? '#E8C97E' : req.rank === 'verified' ? '#4DB8CC' : '#93c5fd',
                      border: `1px solid ${req.rank === 'premium' ? 'rgba(232,201,126,0.4)' : req.rank === 'verified' ? 'rgba(0,78,100,0.4)' : 'rgba(59,130,246,0.4)'}` 
                    }}>
                      {req.rank === 'premium' ? '⭐ Premium' : req.rank === 'verified' ? '✓ Verified' : '🥉 Starter'}
                    </span>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{new Date(req.created_at).toLocaleDateString()}</p>
                    {req.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => approveRank(req.id, req.seller_id, req.rank, req.screenshot_url)} style={{ background: 'rgba(0,78,100,0.4)', border: '1px solid rgba(0,78,100,0.6)', color: '#4DB8CC', borderRadius: '9999px', padding: '8px 16px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                          Approve ✓
                        </button>
                        <button onClick={() => rejectRank(req.id, req.screenshot_url)} style={{ background: 'rgba(255,80,80,0.15)', border: '1px solid rgba(255,80,80,0.3)', color: '#f87171', borderRadius: '9999px', padding: '8px 16px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                          Reject ✗
                        </button>
                      </div>
                    ) : (
                      <span style={{ padding: '6px 14px', borderRadius: '9999px', fontSize: '12px', fontWeight: '700', background: req.status === 'approved' ? 'rgba(0,200,100,0.15)' : 'rgba(255,80,80,0.15)', color: req.status === 'approved' ? '#4ade80' : '#f87171' }}>
                        {req.status === 'approved' ? 'Approved ✓' : 'Rejected ✗'}
                      </span>
                    )}
                  </div>
                ))}
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
                      {user.role === 'admin' ? '⚙️ Admin' : user.role === 'seller' ? '🏪 Seller' : '👤 Buyer'}
                    </span>

                    {user.rank && user.rank !== 'none' && (
                      <span style={{
                        padding: '3px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: '700',
                        background: user.rank === 'premium' ? 'rgba(232,201,126,0.2)' : user.rank === 'verified' ? 'rgba(0,78,100,0.2)' : 'rgba(59,130,246,0.2)',
                        color: user.rank === 'premium' ? '#E8C97E' : user.rank === 'verified' ? '#4DB8CC' : '#93c5fd',
                      }}>
                        {user.rank === 'premium' ? '⭐ Premium' : user.rank === 'verified' ? '✓ Verified' : '🥉 Starter'}
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
                      {user.banned ? 'Unban ✓' : 'Ban 🚫'}
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
                    </div>
                  </div>
                  {seller.rank && seller.rank !== 'none' && (
                    <span style={{ padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '700', background: seller.rank === 'premium' ? 'rgba(232,201,126,0.2)' : seller.rank === 'verified' ? 'rgba(0,78,100,0.2)' : 'rgba(59,130,246,0.2)', color: seller.rank === 'premium' ? '#E8C97E' : seller.rank === 'verified' ? '#4DB8CC' : '#93c5fd' }}>
                      {seller.rank === 'premium' ? '⭐ Premium' : seller.rank === 'verified' ? '✓ Verified' : '🥉 Starter'}
                    </span>
                  )}
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{productCounts.filter(p => p.seller_id === seller.id).length} products</p>
                  <button onClick={() => banSeller(seller.id, !seller.banned)} style={{
                    background: seller.banned ? 'rgba(0,78,100,0.3)' : 'rgba(255,80,80,0.15)',
                    border: `1px solid ${seller.banned ? 'rgba(0,78,100,0.5)' : 'rgba(255,80,80,0.3)'}`,
                    color: seller.banned ? '#4DB8CC' : '#f87171',
                    borderRadius: '9999px', padding: '8px 16px', cursor: 'pointer', fontSize: '13px', fontWeight: '600'
                  }}>
                    {seller.banned ? 'Unban ✓' : 'Ban 🚫'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div style={{ ...glassCard, padding: '24px' }}>
            <h2 style={{ color: 'white', fontWeight: '800', fontSize: '20px', marginBottom: '20px' }}>All Products</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {products.map(product => (
                <div key={product.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '10px', overflow: 'hidden', background: 'rgba(255,255,255,0.06)', flexShrink: 0 }}>
                      {product.image_url && <img src={product.image_url.startsWith('http') ? product.image_url : `https://oisdppgqifhbtlanglwr.supabase.co/storage/v1/object/public/Product/${product.image_url}`} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <div>
                      <p style={{ color: 'white', fontWeight: '600', margin: 0 }}>{product.name}</p>
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '2px 0 0 0' }}>by {product.profiles?.name || product.profiles?.full_name}</p>
                    </div>
                  </div>
                  <span style={{ color: '#4DB8CC', fontSize: '12px', textTransform: 'uppercase' }}>{product.category}</span>
                  <span style={{ color: '#E8C97E', fontWeight: '700' }}>${product.price}</span>
                  <button onClick={() => deleteProduct(product.id)} style={{ background: 'rgba(255,80,80,0.15)', border: '1px solid rgba(255,80,80,0.3)', color: '#f87171', borderRadius: '9999px', padding: '8px 16px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                    Delete 🗑
                  </button>
                </div>
              ))}
            </div>
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
                      {order.status === 'completed' ? 'Completed ✓' : order.status === 'shipped' ? 'Shipped 📦' : 'Pending ⏳'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* RANK PAYMENTS TAB */}
        {activeTab === 'payments' && (
          <div style={{ ...glassCard, padding: '24px' }}>
            <h2 style={{ color: 'white', fontWeight: '800', fontSize: '20px', marginBottom: '8px' }}>Rank Payments</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '20px' }}>
              Total: {rankPayments.length} payments ({rankPayments.filter(p => p.status === 'pending').length} pending)
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {rankPayments.map(req => (
                <div key={req.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(0,78,100,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4DB8CC', fontWeight: '700', fontSize: '16px' }}>
                        {(req.profiles?.name || req.seller_name || 'S').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ color: 'white', fontWeight: '700', margin: '0 0 2px 0' }}>
                          {req.seller_name || req.profiles?.name || req.profiles?.full_name || 'Unknown'}
                        </p>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0 }}>
                          {req.profiles?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <span style={{
                    padding: '4px 14px', borderRadius: '9999px', fontSize: '12px', fontWeight: '700',
                    background: req.rank === 'premium' ? 'rgba(232,201,126,0.2)' : req.rank === 'verified' ? 'rgba(0,78,100,0.2)' : 'rgba(59,130,246,0.2)',
                    color: req.rank === 'premium' ? '#E8C97E' : req.rank === 'verified' ? '#4DB8CC' : '#93c5fd',
                    border: `1px solid ${req.rank === 'premium' ? 'rgba(232,201,126,0.4)' : req.rank === 'verified' ? 'rgba(0,78,100,0.4)' : 'rgba(59,130,246,0.4)'}` 
                  }}>
                    {req.rank === 'premium' ? '⭐ Premium' : req.rank === 'verified' ? '✓ Verified' : '🥉 Starter'}
                  </span>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '10px 14px' }}>
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px 0' }}>Shop Name</p>
                      <p style={{ color: 'white', fontSize: '14px', fontWeight: '600', margin: 0 }}>{req.shop_name || 'N/A'}</p>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '10px 14px' }}>
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px 0' }}>Phone</p>
                      <p style={{ color: 'white', fontSize: '14px', fontWeight: '600', margin: 0 }}>{req.phone || 'N/A'}</p>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '10px 14px' }}>
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px 0' }}>Submitted</p>
                      <p style={{ color: 'white', fontSize: '14px', fontWeight: '600', margin: 0 }}>{new Date(req.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {req.screenshot_url && (
                    <div style={{ marginBottom: '16px' }}>
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Payment Screenshot</p>
                      <a href={req.screenshot_url} target="_blank" rel="noopener noreferrer">
                        <img src={req.screenshot_url} alt="Payment proof" style={{ maxWidth: '300px', maxHeight: '200px', borderRadius: '12px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }} />
                      </a>
                      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginTop: '6px' }}>Click to view full size</p>
                    </div>
                  )}

                  {req.status === 'pending' ? (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => approveRank(req.id, req.seller_id, req.rank, req.screenshot_url)} style={{ background: 'rgba(0,78,100,0.4)', border: '1px solid rgba(0,78,100,0.6)', color: '#4DB8CC', borderRadius: '9999px', padding: '10px 24px', cursor: 'pointer', fontSize: '14px', fontWeight: '700' }}>
                        Approve ✓
                      </button>
                      <button onClick={() => rejectRank(req.id, req.screenshot_url)} style={{ background: 'rgba(255,80,80,0.15)', border: '1px solid rgba(255,80,80,0.3)', color: '#f87171', borderRadius: '9999px', padding: '10px 24px', cursor: 'pointer', fontSize: '14px', fontWeight: '700' }}>
                        Reject ✗
                      </button>
                    </div>
                  ) : (
                    <span style={{ padding: '8px 18px', borderRadius: '9999px', fontSize: '13px', fontWeight: '700', background: req.status === 'approved' ? 'rgba(0,200,100,0.15)' : 'rgba(255,80,80,0.15)', color: req.status === 'approved' ? '#4ade80' : '#f87171' }}>
                      {req.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === 'reports' && (
          <div style={{ ...glassCard, padding: '24px' }}>
            <h2 style={{ color: 'white', fontWeight: '800', fontSize: '20px', marginBottom: '20px' }}>Reports</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reports.length === 0 ? (
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '20px' }}>No reports submitted yet.</p>
              ) : (
                reports.map(report => (
                  <div key={report.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(0,78,100,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4DB8CC', fontWeight: '700', fontSize: '16px' }}>
                          {(report.seller?.name || report.seller_name || report.profiles?.full_name || 'S').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ color: 'white', fontWeight: '700', margin: '0 0 2px 0' }}>
                            {report.seller_name || report.seller_name || report.profiles?.full_name || 'Unknown'}
                          </p>
                          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0 }}>
                            {report.seller?.email}
                          </p>
                        </div>
                      </div>
                      <div style={{ padding: '16px' }}>
                        <span style={{ color: '#FF6B6B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600', padding: '3px 8px', borderRadius: '4px' }}>
                          {report.reason}
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
                          onClick={async () => {
                            await supabase.from('profiles').update({ banned: true }).eq('id', report.seller_id)
                            await supabase.from('reports').update({ status: 'reviewed' }).eq('id', report.id)
                          }}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#EF4444',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '700'
                          }}
                        >
                          Ban Seller
                        </button>
                      </div>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: '8px 0 0 0' }}>
                      {new Date(report.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
