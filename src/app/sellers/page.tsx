'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Star, Check, Sparkles, TrendingUp, ShieldCheck, Heart } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'

export default function SellersPage() {
  const { t, lang } = useLang()
  const [premiumSellers, setPremiumSellers] = useState<any[]>([])
  const [topSellers, setTopSellers] = useState<any[]>([])
  const [newSellers, setNewSellers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [windowWidth, setWindowWidth] = useState(1200)

  const isMobile = windowWidth < 768

  useEffect(() => {
    setWindowWidth(window.innerWidth)
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    async function fetchSellers() {
      setLoading(true)
      try {
        // Load premium sellers for spotlight
        const { data: premiumSellersData } = await supabase
          .from('profiles')
          .select('*, products(id, images)')
          .eq('tier', 'premium')
          .limit(6)
          .order('created_at', { ascending: false })
        setPremiumSellers(premiumSellersData || [])

        // Load top sellers (premium + verified)
        const { data: topSellersData } = await supabase
          .from('profiles')
          .select('*, products(id, images)')
          .in('tier', [3, 2])
          .limit(12)
          .order('created_at', { ascending: false })
        setTopSellers(topSellersData || [])

        // Load new sellers (starter)
        const { data: newSellersData } = await supabase
          .from('profiles')
          .select('*, products(id, images)')
          .eq('tier', 1)
          .limit(10)
        setNewSellers(newSellersData || [])
      } catch (error) {
        console.error('Error fetching sellers:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSellers()
  }, [])

  const glassStyle = {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '24px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
  }

  return (
    <div key={lang} className="relative z-10 bg-[#f8fafc] min-h-screen">
      <Navbar />
      
      <div 
        className="min-h-full sm:min-h-screen" 
        style={{ 
          paddingTop: isMobile ? '100px' : '140px',
          paddingBottom: '80px'
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          
          {/* Sellers Header */}
          <div style={{ marginBottom: '40px', textAlign: 'center' }}>
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: 'rgba(77,184,204,0.1)', 
              color: '#004E64', 
              padding: '6px 16px', 
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: '700',
              marginBottom: '16px'
            }}>
              <Sparkles size={14} /> Registered Shops
            </span>
            <h1 style={{ 
              color: '#0f172a', 
              fontSize: isMobile ? '32px' : '44px', 
              fontWeight: '900', 
              letterSpacing: '-1px',
              margin: '0 0 12px 0' 
            }}>
              Meet Our Sellers
            </h1>
            <p style={{ 
              color: '#64748b', 
              fontSize: '16px', 
              maxWidth: '600px', 
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Explore real shops, trusted local merchants, and premium boutiques in Cambodia. Chat directly, no middleman.
            </p>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid rgba(0, 78, 100, 0.1)',
                borderTopColor: '#004E64',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>Loading merchant directory...</p>
              <style jsx global>{`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '56px' }}>

              {/* PREMIUM SELLERS SPOTLIGHT */}
              {premiumSellers.length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      background: 'rgba(232,201,126,0.15)', 
                      borderRadius: '12px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: '#E8C97E'
                    }}>
                      <Star size={20} fill="#E8C97E" />
                    </div>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '700', margin: 0 }}>
                        {t('home.premium_sellers') || 'Featured Spotlight'}
                      </p>
                      <h2 style={{ color: '#0f172a', fontSize: '24px', fontWeight: '900', margin: 0 }}>
                        {t('home.premium_spotlight') || 'Premium Merchants'}
                      </h2>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {premiumSellers.map(seller => (
                      <Link href={`/seller/${seller.id}`} key={seller.id} className="no-underline">
                        <div style={{
                          background: 'rgba(232,201,126,0.04)',
                          border: '2px solid rgba(232,201,126,0.2)',
                          borderRadius: '24px',
                          padding: '24px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: '0 4px 20px rgba(232,201,126,0.03)'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'translateY(-4px)'
                          e.currentTarget.style.boxShadow = '0 12px 30px rgba(232,201,126,0.1)'
                          e.currentTarget.style.borderColor = 'rgba(232,201,126,0.5)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = '0 4px 20px rgba(232,201,126,0.03)'
                          e.currentTarget.style.borderColor = 'rgba(232,201,126,0.2)'
                        }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                              <div style={{ 
                                width: '52px', 
                                height: '52px', 
                                borderRadius: '50%', 
                                background: 'rgba(232,201,126,0.15)', 
                                border: '2px solid rgba(232,201,126,0.3)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                color: '#E8C97E', 
                                fontWeight: '900', 
                                fontSize: '20px', 
                                flexShrink: 0, 
                                overflow: 'hidden' 
                              }}>
                                {seller.avatar_url ? (
                                  <img src={seller.avatar_url} alt={seller.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  (seller.name || seller.full_name || 'S').charAt(0).toUpperCase()
                                )}
                              </div>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                  <p style={{ color: '#0f172a', fontWeight: '800', fontSize: '16px', margin: 0 }}>
                                    {seller.name || seller.full_name}
                                  </p>
                                  <span style={{ 
                                    background: 'rgba(232,201,126,0.15)', 
                                    border: '1px solid rgba(232,201,126,0.3)', 
                                    color: '#b48a2d', 
                                    fontSize: '10px', 
                                    fontWeight: '700', 
                                    padding: '2px 8px', 
                                    borderRadius: '9999px', 
                                    whiteSpace: 'nowrap',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}>
                                    <Star size={10} fill="#b48a2d" /> Premium
                                  </span>
                                </div>
                                <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>
                                  {seller.products?.length || 0} {t('home.products_listed') || 'products'}
                                </p>
                              </div>
                            </div>
                            {seller.bio && (
                              <p style={{ 
                                color: '#475569', 
                                fontSize: '13px', 
                                margin: '0 0 16px 0', 
                                lineHeight: '1.5', 
                                display: '-webkit-box', 
                                WebkitLineClamp: 3, 
                                WebkitBoxOrient: 'vertical', 
                                overflow: 'hidden' 
                              }}>
                                {seller.bio}
                              </p>
                            )}
                          </div>
                          <p style={{ color: '#b48a2d', fontSize: '13px', fontWeight: '700', margin: '12px 0 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            Visit Shop →
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* TOP SELLERS SECTION */}
              {topSellers.length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      background: 'rgba(0,78,100,0.1)', 
                      borderRadius: '12px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: '#004E64'
                    }}>
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '700', margin: 0 }}>
                        {t('home.top_sellers') || 'Top Sellers'}
                      </p>
                      <h2 style={{ color: '#0f172a', fontSize: '24px', fontWeight: '900', margin: 0 }}>
                        Verified Directory
                      </h2>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    {topSellers.map(seller => (
                      <Link href={`/seller/${seller.id}`} key={seller.id} className="no-underline">
                        <div style={{
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '12px',
                          background: seller.rank === 'premium' ? 'rgba(232,201,126,0.08)' : 'rgba(0,78,100,0.06)',
                          border: `1px solid ${seller.rank === 'premium' ? 'rgba(232,201,126,0.2)' : 'rgba(0,78,100,0.15)'}`,
                          borderRadius: '9999px',
                          padding: '10px 20px 10px 10px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'translateY(-2px)'
                          e.currentTarget.style.boxShadow = '0 6px 15px rgba(0,0,0,0.05)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.02)'
                        }}
                        >
                          <div style={{ 
                            width: '36px', 
                            height: '36px', 
                            borderRadius: '50%', 
                            background: seller.rank === 'premium' ? 'rgba(232,201,126,0.2)' : 'rgba(0,78,100,0.2)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            color: seller.rank === 'premium' ? '#E8C97E' : '#4DB8CC', 
                            fontWeight: '700', 
                            fontSize: '14px', 
                            overflow: 'hidden', 
                            flexShrink: 0 
                          }}>
                            {seller.avatar_url ? (
                              <img src={seller.avatar_url} alt={seller.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              (seller.name || seller.full_name || 'S').charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p style={{ 
                              color: seller.rank === 'premium' ? '#b48a2d' : '#004E64', 
                              fontWeight: '750', 
                              fontSize: '14px', 
                              margin: 0,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              {seller.rank === 'premium' ? <Star size={12} fill="#b48a2d" /> : <Check size={12} />} {seller.name || seller.full_name}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* NEW SELLERS SECTION */}
              {newSellers.length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      background: 'rgba(59,130,246,0.1)', 
                      borderRadius: '12px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: '#2563eb'
                    }}>
                      <TrendingUp size={20} />
                    </div>
                    <div>
                      <p style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '700', margin: 0 }}>
                        {t('home.new_sellers') || 'New Shops'}
                      </p>
                      <h2 style={{ color: '#0f172a', fontSize: '24px', fontWeight: '900', margin: 0 }}>
                        {t('home.just_started') || 'Recently Joined Merchants'}
                      </h2>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {newSellers.map(seller => (
                      <Link href={`/seller/${seller.id}`} key={seller.id} className="no-underline">
                        <div style={{
                          background: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '20px',
                          padding: '20px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.01)',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'translateY(-2px)'
                          e.currentTarget.style.borderColor = '#93c5fd'
                          e.currentTarget.style.boxShadow = '0 8px 20px rgba(59,130,246,0.05)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.borderColor = '#e2e8f0'
                          e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.01)'
                        }}
                        >
                          <div>
                            <div style={{ 
                              width: '44px', 
                              height: '44px', 
                              borderRadius: '50%', 
                              background: 'rgba(59,130,246,0.1)', 
                              border: '2px solid rgba(59,130,246,0.2)', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              color: '#2563eb', 
                              fontWeight: '700', 
                              fontSize: '16px', 
                              marginBottom: '12px', 
                              overflow: 'hidden' 
                            }}>
                              {seller.avatar_url ? (
                                <img src={seller.avatar_url} alt={seller.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                (seller.name || seller.full_name || 'S').charAt(0).toUpperCase()
                              )}
                            </div>
                            <p style={{ color: '#0f172a', fontWeight: '700', fontSize: '15px', margin: '0 0 4px 0' }}>
                              🥉 {seller.name || seller.full_name}
                            </p>
                          </div>
                          <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>
                            {seller.products?.length || 0} {t('home.products_listed') || 'products'}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  )
}
