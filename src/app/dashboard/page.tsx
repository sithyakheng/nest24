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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'seller') {
        router.push('/')
        return
      }

      setUser(user)
      setProfile(profile)

      // Load products
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })

      setProducts(products || [])

      // Load orders
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })

      setOrders(orders || [])
      setLoading(false)
    }

    loadDashboard()
  }, [])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#080a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '16px' }}>
        Loading dashboard...
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080a0f', paddingTop: '100px', paddingBottom: '80px' }}>
      {/* Background Effects */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-150px', left: '-100px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,78,100,0.4) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '-150px', right: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,201,126,0.25) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ color: 'white', fontSize: '36px', fontWeight: '900', margin: '0 0 8px 0' }}>
              Welcome back, {profile?.name || profile?.full_name || 'Seller'}!
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px', margin: 0 }}>
              Manage your shop and track your sales
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link href="/dashboard/ranks">
              <div style={{
                background: 'linear-gradient(135deg, #E8C97E, #F0B429)',
                color: 'black',
                fontWeight: '900',
                fontSize: '14px',
                borderRadius: '9999px',
                padding: '12px 24px',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(232,201,126,0.3)'
              }}>
                🏆 Get Rank
              </div>
            </Link>
            
            <Link href="/profile">
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                fontWeight: '700',
                fontSize: '14px',
                borderRadius: '9999px',
                padding: '12px 24px',
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                Profile
              </div>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderTop: '1px solid rgba(255,255,255,0.22)',
            borderRadius: '20px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '32px' }}>📦</span>
              <span style={{ color: '#4DB8CC', fontSize: '24px', fontWeight: '900' }}>{products.length}</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: 0 }}>Total Products</p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderTop: '1px solid rgba(255,255,255,0.22)',
            borderRadius: '20px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '32px' }}>🛒</span>
              <span style={{ color: '#E8C97E', fontSize: '24px', fontWeight: '900' }}>{orders.length}</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: 0 }}>Total Orders</p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderTop: '1px solid rgba(255,255,255,0.22)',
            borderRadius: '20px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '32px' }}>⭐</span>
              <span style={{ color: '#93c5fd', fontSize: '24px', fontWeight: '900' }}>
                {profile?.rank === 'premium' ? 'Premium' : profile?.rank === 'verified' ? 'Verified' : profile?.rank === 'starter' ? 'Starter' : 'None'}
              </span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: 0 }}>Current Rank</p>
          </div>
        </div>

        {/* Recent Products */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ color: 'white', fontSize: '24px', fontWeight: '800', margin: 0 }}>Recent Products</h2>
            <Link href="/products">
              <span style={{ color: '#4DB8CC', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>View All →</span>
            </Link>
          </div>
          
          {products.length === 0 ? (
            <div style={{
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderTop: '1px solid rgba(255,255,255,0.22)',
              borderRadius: '20px',
              padding: '48px',
              textAlign: 'center'
            }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '16px', margin: '0 0 24px 0' }}>No products yet</p>
              <Link href="/products">
                <div style={{
                  background: 'linear-gradient(135deg, #4DB8CC, #0a7890)',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '14px',
                  borderRadius: '9999px',
                  padding: '12px 24px',
                  cursor: 'pointer',
                  display: 'inline-block'
                }}>
                  Add Your First Product
                </div>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {products.slice(0, 3).map(product => (
                <div key={product.id} style={{
                  background: 'rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderTop: '1px solid rgba(255,255,255,0.22)',
                  borderRadius: '20px',
                  overflow: 'hidden'
                }}>
                  <div style={{ height: '160px', background: 'rgba(255,255,255,0.04)', position: 'relative' }}>
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)' }}>
                        No Image
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '16px' }}>
                    <h3 style={{ color: 'white', fontWeight: '600', fontSize: '16px', margin: '0 0 8px 0' }}>{product.name}</h3>
                    <p style={{ color: '#E8C97E', fontWeight: '900', fontSize: '18px', margin: '0 0 8px 0' }}>${product.price}</p>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0 }}>Stock: {product.stock}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ color: 'white', fontSize: '24px', fontWeight: '800', margin: 0 }}>Recent Orders</h2>
            <Link href="/orders">
              <span style={{ color: '#4DB8CC', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>View All →</span>
            </Link>
          </div>
          
          {orders.length === 0 ? (
            <div style={{
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderTop: '1px solid rgba(255,255,255,0.22)',
              borderRadius: '20px',
              padding: '48px',
              textAlign: 'center'
            }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '16px', margin: 0 }}>No orders yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {orders.slice(0, 3).map(order => (
                <div key={order.id} style={{
                  background: 'rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderTop: '1px solid rgba(255,255,255,0.22)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <p style={{ color: 'white', fontWeight: '600', fontSize: '16px', margin: '0 0 4px 0' }}>
                      Order #{order.id.slice(0, 8)}
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: 0 }}>
                      {order.products?.name || 'Product'} • ${order.total}
                    </p>
                  </div>
                  <span style={{
                    padding: '6px 12px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: order.status === 'completed' ? 'rgba(0,200,100,0.2)' : 'rgba(232,201,126,0.2)',
                    color: order.status === 'completed' ? '#4ade80' : '#E8C97E'
                  }}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
