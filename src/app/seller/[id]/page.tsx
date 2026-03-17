'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useLang } from '@/contexts/LanguageContext'
import { useTheme } from '@/contexts/ThemeContext'
import Navbar from '@/components/Navbar'
import { Star, Check, Medal, Send, Facebook, Shield, Flag, ThumbsUp, Package } from 'lucide-react'

export default function SellerShopPage() {
  const { lang } = useLang()
  const { theme, isDark, background, backgroundSecondary, text, textSecondary, border } = useTheme()
  const { id } = useParams()
  const [seller, setSeller] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [windowWidth, setWindowWidth] = useState(1200)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportDetails, setReportDetails] = useState('')
  const [reportSubmitting, setReportSubmitting] = useState(false)
  const [reportSuccess, setReportSuccess] = useState(false)

  const isMobile = windowWidth < 768
  const isSmallMobile = windowWidth < 480

  const translations = {
    en: {
      products: 'Products',
      noProducts: 'No products yet',
      notFound: 'Shop not found',
      back: 'Back to Store',
      contact: 'Contact Seller',
      trusted: 'Trusted Seller',
      followers: 'Products Listed',
      visit: 'Visit Shop',
      phone: 'Phone',
      whatsapp: 'WhatsApp',
      telegram: 'Telegram',
      facebook: 'Facebook',
      instagram: 'Instagram',
      share: 'Share Shop',
      copied: 'Link Copied!',
      loading: 'Loading...',
      noContactInfo: 'No contact info available',
    },
    kh: {
      products: 'ផលិតផល',
      noProducts: 'មិនទាន់មានផលិតផលទេ',
      notFound: 'រកមិនឃើញហាង',
      back: 'ត្រឡប់ទៅហាង',
      contact: 'ទំនាក់ទំនងអ្នកលក់',
      trusted: 'អ្នកលក់ទុកចិត្ត',
      followers: 'ផលិតផលដែលបានចុះបញ្ជី',
      visit: 'ចូលទៅហាង',
      phone: 'ទូរស័ព្ទ',
      whatsapp: 'វ៉ាតសាប',
      telegram: 'តេឡេក្រាម',
      facebook: 'ហ្វេសប៊ុក',
      instagram: 'អ៊ីនស្តាក្រាម',
      share: 'ចែករំលែកហាង',
      copied: 'បានចម្លងតំណ!',
      loading: 'កំនឹង...',
      noContactInfo: 'មិនទាន់មានផលិតផលទេ',
    }
  }

  const languageText = lang === 'kh' ? translations.kh : translations.en

  useEffect(() => {
    setWindowWidth(window.innerWidth)
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    async function load() {
      try {
        console.log('Loading seller with id:', id)
        
        // First try to find by shop_slug
        let { data: seller } = await supabase
          .from('profiles')
          .select('*')
          .eq('shop_slug', id)
          .single()

        // If not found, try by name
        if (!seller) {
          console.log('Not found by shop_slug, trying by name')
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('name', id)
            .single()
          seller = data
        }

        console.log('Final seller data:', seller)

        if (!seller) {
          console.log('Seller not found')
          setSeller(null)
          setLoading(false)
          return
        }

        setSeller(seller)

        // Fetch seller products - add null check
        if (seller.id) {
          const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select('*')
            .eq('seller_id', seller.id)
            .order('created_at', { ascending: false })

          console.log('Products data:', productsData)
          console.log('Products error:', productsError)

          if (productsError) {
            console.error('Error fetching products:', productsError)
          }

          setProducts(productsData || [])
        } else {
          console.error('Seller ID is null')
          setProducts([])
        }

        setLoading(false)
      } catch (error) {
        console.error('Unexpected error:', error)
        setSeller(null)
        setLoading(false)
      }
    }
    
    if (id) {
      load()
    }
  }, [id])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)' }}>
      {languageText.loading}
    </div>
  )

  if (!seller) return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
      {languageText.notFound}
    </div>
  )

  const getImageUrl = (url: string) => {
    if (!url) return ''
    if (url.startsWith('http')) return url
    return `https://oisdppgqifhbtlanglwr.supabase.co/storage/v1/object/public/Product/${url}` 
  }

  const rankColor = seller.rank === 'premium' ? '#E8C97E' : seller.rank === 'verified' ? '#4DB8CC' : seller.rank === 'starter' ? '#93c5fd' : '#6b7280'
  const rankBg = seller.rank === 'premium' ? 'rgba(232,201,126,0.15)' : seller.rank === 'verified' ? 'rgba(0,78,100,0.15)' : seller.rank === 'starter' ? 'rgba(59,130,246,0.15)' : 'rgba(107,114,128,0.15)'
  const rankBorder = seller.rank === 'premium' ? 'rgba(232,201,126,0.4)' : seller.rank === 'verified' ? 'rgba(0,78,100,0.4)' : seller.rank === 'starter' ? 'rgba(59,130,246,0.4)' : 'rgba(107,114,128,0.4)'

  return (
    <div>
      <Navbar />
      <div style={{ 
        minHeight: '100vh', 
        background: '#f9fafb',
        color: '#111827',
        paddingTop: '100px', 
        paddingBottom: '60px', 
        position: 'relative' 
      }}>

      {/* Orbs */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-150px', left: '-100px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,78,100,0.4) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '-150px', right: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,201,126,0.25) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>

        {/* Back button */}
        <Link href="/browse">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px', marginBottom: '32px', cursor: 'pointer' }}>
            {languageText.back}
          </div>
        </Link>

        {/* Shop Profile Header */}
        <div style={{
          background: '#ffffff',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: rankColor ? `1px solid ${rankBorder}` : '#e2e8f0',
          borderTop: rankColor ? `1px solid ${rankBorder}` : '#e2e8f0',
          borderRadius: '24px',
          padding: '40px',
          marginBottom: '32px',
          boxShadow: rankColor ? `0 0 40px ${rankBg}` : 'none'
        }}>

          
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap', flexDirection: isMobile ? 'column' : 'row' }}>

            {/* Avatar */}
            <div style={{
              width: '90px', height: '90px', borderRadius: '50%', flexShrink: 0,
              background: rankColor ? rankBg : 'rgba(0,78,100,0.3)',
              border: rankColor ? `3px solid ${rankBorder}` : '3px solid rgba(0,78,100,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: rankColor || '#4DB8CC', fontWeight: '900', fontSize: '32px',
              overflow: 'hidden'
            }}>
              {seller.avatar_url ? (
                <img src={seller.avatar_url} alt={seller.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                (seller.name || seller.full_name || 'S').charAt(0).toUpperCase()
              )}
            </div>

            {/* Shop Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
                <h1 style={{ color: 'white', fontSize: '28px', fontWeight: '900', margin: 0 }}>
                  {seller.name || seller.full_name || 'Shop'}
                </h1>
                {rankColor && (
                  <span style={{ background: rankBg, border: `1px solid ${rankBorder}`, color: rankColor, fontSize: '12px', fontWeight: '700', padding: '4px 12px', borderRadius: '9999px' }}>
                    {seller.rank === 'premium' ? <><Star size={12} /> Premium</> : seller.rank === 'verified' ? <><Check size={12} /> Verified</> : seller.rank === 'starter' ? <><Medal size={12} /> Starter</> : <><Package size={12} /> Free</>}
                  </span>
                )}
              </div>

              {seller.bio && (
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: '1.6', margin: '0 0 16px 0', maxWidth: '600px' }}>
                  {seller.bio}
                </p>
              )}

              {/* Stats row */}
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 2px 0' }}>Products</p>
                  <p style={{ color: 'white', fontWeight: '800', fontSize: '20px', margin: 0 }}>{products.length}</p>
                </div>
                {seller.rank && seller.rank !== 'none' && (
                  <div>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 2px 0' }}>Rank</p>
                    <p style={{ color: rankColor || 'white', fontWeight: '800', fontSize: '20px', margin: 0 }}>
                      {seller.rank === 'premium' ? 'Premium' : seller.rank === 'verified' ? 'Verified' : seller.rank === 'starter' ? 'Starter' : 'Free'}
                    </p>
                  </div>
                )}
                {seller.rank === 'verified' || seller.rank === 'premium' ? (
                  <div>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 2px 0' }}>Status</p>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Contact Info */}
            <div style={{
              background: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '20px',
              minWidth: '200px'
            }}>
              <p style={{ color: '#111827', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px 0' }}>
                {languageText.contact}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {seller.phone && (
                  <p style={{ color: '#111827', fontSize: '14px', margin: 0 }}>📞 {seller.phone}</p>
                )}
                {seller.whatsapp && (
                  <a href={`https://wa.me/${seller.whatsapp.replace(/\D/g, '')}`} target="_blank" style={{ color: '#4DB8CC', fontSize: '14px', textDecoration: 'none' }}>
                    💬 WhatsApp
                  </a>
                )}
                {seller.telegram && (
                  <a href={`https://t.me/${seller.telegram.replace('@', '')}`} target="_blank" style={{ color: '#4DB8CC', fontSize: '14px', textDecoration: 'none' }}>
                    <Send size={14} style={{ marginRight: '4px' }} />Telegram
                  </a>
                )}
                {seller.facebook && (
                  <a href={seller.facebook.startsWith('http') ? seller.facebook : `https://${seller.facebook}`} target="_blank" style={{ color: '#4DB8CC', fontSize: '14px', textDecoration: 'none' }}>
                    <ThumbsUp size={14} style={{ marginRight: '4px' }} />Facebook
                  </a>
                )}
                {seller.instagram && (
                  <a href={`https://instagram.com/${seller.instagram.replace('@', '')}`} target="_blank" style={{ color: '#4DB8CC', fontSize: '14px', textDecoration: 'none' }}>
                    📸 Instagram
                  </a>
                )}
                {!seller.phone && !seller.whatsapp && !seller.telegram && !seller.facebook && !seller.instagram && (
                  <p style={{ color: isDark ? '#ffffff' : '#1a1a1a', fontSize: '13px', margin: 0 }}>{languageText.noContactInfo}</p>
                )}
              </div>
            </div>

          </div>

          {/* Trusted seller message */}
          {seller.rank && seller.rank !== 'none' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,200,100,0.08)', border: '1px solid rgba(0,200,100,0.2)', borderRadius: '10px', padding: '10px 14px', marginTop: '20px' }}>
              <Shield size={16} />
              <p style={{ color: '#4ade80', fontSize: '13px', fontWeight: '600', margin: 0 }}>
                {seller.rank === 'premium' ? 'Premium Seller — Top rated on NestKH' : seller.rank === 'verified' ? 'Verified Seller — Trusted by NestKH' : seller.rank === 'starter' ? 'Starter Seller — Growing on NestKH' : 'Free Seller — Join the NestKH community'}
              </p>
            </div>
          )}

        </div>

        {/* Report button */}
        <button
          onClick={() => setShowReportModal(true)}
          style={{
            background: 'transparent',
            border: '1px solid #ef4444',
            color: '#ef4444',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '13px',
            cursor: 'pointer',
            marginTop: '12px'
          }}
        >
          <Flag size={14} /> Report Shop
        </button>

        {/* Products Grid */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ color: '#111827', fontSize: '22px', fontWeight: '900', margin: 0 }}>
              {languageText.products} ({products.length})
            </h2>
          </div>

          {products.length === 0 ? (
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '60px', textAlign: 'center' }}>
              <p>{languageText.noProducts}</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
              {products.map(product => (
                <Link href={`/products/${product.id}`} key={product.id}>
                  <div
                    style={{
                      background: 'white',
                      backdropFilter: 'blur(24px)',
                      WebkitBackdropFilter: 'blur(24px)',
                      border: rankColor ? `1px solid ${rankBorder}` : '#e5e7eb',
                      borderTop: '1px solid #e5e7eb',
                      borderRadius: '20px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-4px)'
                      e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.4)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <div style={{ height: '200px', overflow: 'hidden', background: 'rgba(255,255,255,0.04)', position: 'relative' }}>
                      {product.image_url ? (
                        <img src={getImageUrl(product.image_url)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)' }}>No Image</div>
                      )}
                      {rankColor && (
                        <span style={{ position: 'absolute', top: '8px', right: '8px', background: rankBg, border: `1px solid ${rankBorder}`, color: rankColor, fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '9999px', backdropFilter: 'blur(8px)' }}>
                          {seller.rank === 'premium' ? <><Star size={10} /> Premium</> : seller.rank === 'verified' ? <><Check size={10} /> Verified</> : seller.rank === 'starter' ? <><Medal size={10} /> Starter</> : <><Package size={10} /> Free</>}
                        </span>
                      )}
                    </div>
                    <div style={{ padding: '16px' }}>
                      <span style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600' }}>{product.category}</span>
                      <p style={{ color: isDark ? '#ffffff' : '#0f172a', fontWeight: '600', fontSize: '15px', margin: '6px 0', lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.name}</p>
                      <p style={{ color: isDark ? '#E8C97E' : '#059669', fontWeight: '900', fontSize: '18px', margin: '0 0 4px 0' }}>${product.price}</p>
                      {product.stock <= 5 && product.stock > 0 && (
                        <p style={{ color: '#f87171', fontSize: '12px', margin: 0 }}>Only {product.stock} left!</p>
                      )}
                      {product.stock === 0 && (
                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: 0 }}>Out of stock</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '420px'
          }}>
            <h3 style={{ color: '#111827', margin: '0 0 16px 0' }}>
              <Flag size={14} /> Report Shop
            </h3>

            {reportSuccess ? (
              <p style={{ color: '#10B981', textAlign: 'center', padding: '20px 0' }}>
                ✅ Report submitted. We will review it shortly.
              </p>
            ) : (
              <>
                <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 16px 0' }}>
                  Select a reason for reporting this shop:
                </p>

                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '14px',
                    marginBottom: '12px',
                    background: isDark ? '#1e293b' : 'white',
                    color: isDark ? 'white' : '#0f172a'
                  }}
                >
                  <option value="">Select reason...</option>
                  <option value="scam">Scam / Fraud</option>
                  <option value="fake">Fake Products</option>
                  <option value="inappropriate">Inappropriate Content</option>
                  <option value="spam">Spam</option>
                  <option value="other">Other</option>
                </select>

                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Additional details (optional)..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '14px',
                    marginBottom: '16px',
                    background: isDark ? '#1e293b' : 'white',
                    color: isDark ? 'white' : '#0f172a',
                    resize: 'none'
                  }}
                />

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setShowReportModal(false)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      background: 'transparent',
                      color: isDark ? 'white' : '#0f172a',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (!reportReason) {
                        alert('Please select a reason')
                        return
                      }
                      setReportSubmitting(true)
                      const { error } = await supabase
                        .from('reports')
                        .insert({
                          seller_id: seller?.id,
                          reason: reportReason,
                          details: reportDetails,
                        })
                      setReportSubmitting(false)
                      if (!error) {
                        setReportSuccess(true)
                        setTimeout(() => {
                          setShowReportModal(false)
                          setReportSuccess(false)
                          setReportReason('')
                          setReportDetails('')
                        }, 3000)
                      } else {
                        alert('Failed to submit report')
                      }
                    }}
                    disabled={reportSubmitting}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#ef4444',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '700'
                    }}
                  >
                    {reportSubmitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
