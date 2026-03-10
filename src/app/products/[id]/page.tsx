'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useLang } from '@/contexts/LanguageContext'
import { ThumbsUp, ThumbsDown } from 'lucide-react'

export default function ProductDetailPage() {
  const { t } = useLang()
  const { id } = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [seller, setSeller] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [windowWidth, setWindowWidth] = useState(1200)
  const [likes, setLikes] = useState(0)
  const [dislikes, setDislikes] = useState(0)
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const isMobile = windowWidth < 768

  useEffect(() => {
    setWindowWidth(window.innerWidth)
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (id) fetchProduct()
  }, [id])

  useEffect(() => {
    // Load user's vote from localStorage
    if (id) {
      const savedVote = localStorage.getItem(`vote_${id}`)
      if (savedVote) {
        setUserVote(savedVote as 'like' | 'dislike')
      }
    }
  }, [id])

  const handleVote = async (voteType: 'like' | 'dislike') => {
    if (isUpdating || !id) return

    setIsUpdating(true)
    
    try {
      // Check if user has already voted
      const previousVote = userVote
      
      // Calculate new counts
      let newLikes = likes
      let newDislikes = dislikes
      
      if (previousVote === voteType) {
        // Remove vote
        if (voteType === 'like') {
          newLikes--
        } else {
          newDislikes--
        }
        setUserVote(null)
        localStorage.removeItem(`vote_${id}`)
      } else {
        // Change or add vote
        if (previousVote === 'like') {
          newLikes--
        } else if (previousVote === 'dislike') {
          newDislikes--
        }
        
        if (voteType === 'like') {
          newLikes++
        } else {
          newDislikes++
        }
        
        setUserVote(voteType)
        localStorage.setItem(`vote_${id}`, voteType)
      }

      // Update Supabase
      const { error } = await supabase
        .from('products')
        .update({
          likes: newLikes,
          dislikes: newDislikes
        })
        .eq('id', id)

      if (error) {
        console.error('Error updating vote:', error)
        // Revert state on error
        setLikes(likes)
        setDislikes(dislikes)
        setUserVote(previousVote)
        if (previousVote) {
          localStorage.setItem(`vote_${id}`, previousVote)
        } else {
          localStorage.removeItem(`vote_${id}`)
        }
      } else {
        // Update local state
        setLikes(newLikes)
        setDislikes(newDislikes)
      }
    } catch (error) {
      console.error('Error in handleVote:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  async function fetchProduct() {
    setLoading(true)

    const { data: productData, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !productData) {
      setLoading(false)
      return
    }

    setProduct(productData)
    setLikes(productData.likes || 0)
    setDislikes(productData.dislikes || 0)

    if (productData.seller_id) {
      const { data: sellerData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', productData.seller_id)
        .single()
      setSeller(sellerData)
    }

    setLoading(false)
  }

  const getImageUrl = (url: string): string => {
    if (!url) return ''
    if (url.startsWith('http')) return url
    return `https://oisdppgqifhbtlanglwr.supabase.co/storage/v1/object/public/Product/${url}` 
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#080a0f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(255,255,255,0.4)',
        fontSize: '16px'
      }}>
        Loading...
      </div>
    )
  }

  if (!product) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#080a0f',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(255,255,255,0.4)',
        fontSize: '16px',
        gap: '16px'
      }}>
        <p>{t('product.not_found')}</p>
        <Link href="/" style={{ color: '#4DB8CC' }}>{t('product.back')}</Link>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080a0f',
      paddingTop: '80px',
      paddingBottom: '60px',
      position: 'relative'
    }}>

      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-150px', left: '-100px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,78,100,0.4) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '-150px', right: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,201,126,0.25) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 16px',
        position: 'relative',
        zIndex: 10
      }}>

        {/* Back button */}
        <Link href="/">
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '14px',
            marginBottom: '32px',
            cursor: 'pointer'
          }}>
            ← {t('product.back_to_store')}
          </div>
        </Link>

        {/* Main content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))',
          gap: '24px'
        }}>

          {/* LEFT - Image */}
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderTop: '1px solid rgba(255,255,255,0.22)',
            borderRadius: '24px',
            overflow: 'hidden',
            height: isMobile ? '280px' : 'auto',
            aspectRatio: isMobile ? undefined : '1',
          }}>
            {product.image_url ? (
              <img
                src={getImageUrl(product.image_url)}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255,255,255,0.2)',
                fontSize: '14px'
              }}>
                {t('product.no_image')}
              </div>
            )}
          </div>

          {/* RIGHT - Info */}
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderTop: '1px solid rgba(255,255,255,0.22)',
            borderRadius: '24px',
            padding: isMobile ? '20px' : '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>

            {/* Category */}
            <span style={{
              color: '#4DB8CC',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: '600'
            }}>
              {t('product.category')} {product.category}
            </span>

            {/* Name */}
            <h1 style={{
              color: 'white',
              fontSize: '28px',
              fontWeight: '900',
              lineHeight: '1.2',
              margin: 0
            }}>
              {product.name}
            </h1>

            {/* Price */}
            <div style={{ marginBottom: '16px' }}>
              {product.compare_price && product.compare_price > product.price && (
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '16px', textDecoration: 'line-through', margin: '0 0 4px 0' }}>
                  ${product.compare_price}
                </p>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <p style={{ color: '#E8C97E', fontWeight: '900', fontSize: '32px', margin: '0 0 8px 0' }}>
                  ${product.price}
                  {product.compare_price && product.compare_price > product.price && (
                    <span style={{ background: 'linear-gradient(135deg, #f87171, #ef4444)', color: 'white', fontSize: '13px', fontWeight: '800', padding: '3px 10px', borderRadius: '9999px', marginLeft: '12px' }}>
                      {Math.round((1 - product.price / product.compare_price) * 100)}% {t('product.off')}
                    </span>
                  )}
                </p>
              </div>
              {product.discount > 0 && (
                <span style={{
                  color: 'rgba(255,255,255,0.3)',
                  fontSize: '18px',
                  textDecoration: 'line-through'
                }}>
                  ${(product.price / (1 - product.discount / 100)).toFixed(2)}
                </span>
              )}
            </div>

            {/* Like/Dislike Buttons */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              marginBottom: '16px',
              padding: '12px 0',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              borderBottom: '1px solid rgba(255,255,255,0.08)'
            }}>
              <button
                onClick={() => handleVote('like')}
                disabled={isUpdating}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  border: userVote === 'like' ? '2px solid rgba(0,78,100,0.6)' : '1px solid rgba(255,255,255,0.12)',
                  background: userVote === 'like' 
                    ? 'rgba(0,78,100,0.3)' 
                    : 'rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  color: userVote === 'like' ? '#4DB8CC' : 'rgba(255,255,255,0.8)',
                  cursor: isUpdating ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '700',
                  transition: 'all 0.3s ease',
                  opacity: isUpdating ? 0.6 : 1,
                  boxShadow: userVote === 'like' 
                    ? '0 0 20px rgba(0,78,100,0.3)' 
                    : 'none'
                }}
                onMouseEnter={e => {
                  if (!isUpdating) {
                    e.currentTarget.style.background = userVote === 'like' 
                      ? 'rgba(0,78,100,0.4)' 
                      : 'rgba(0,78,100,0.15)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }
                }}
                onMouseLeave={e => {
                  if (!isUpdating) {
                    e.currentTarget.style.background = userVote === 'like' 
                      ? 'rgba(0,78,100,0.3)' 
                      : 'rgba(255,255,255,0.06)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }
                }}
              >
                <ThumbsUp size={20} /> {likes}
              </button>
              
              <button
                onClick={() => handleVote('dislike')}
                disabled={isUpdating}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  border: userVote === 'dislike' ? '2px solid rgba(255,80,80,0.6)' : '1px solid rgba(255,255,255,0.12)',
                  background: userVote === 'dislike' 
                    ? 'rgba(255,80,80,0.3)' 
                    : 'rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  color: userVote === 'dislike' ? '#f87171' : 'rgba(255,255,255,0.8)',
                  cursor: isUpdating ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '700',
                  transition: 'all 0.3s ease',
                  opacity: isUpdating ? 0.6 : 1,
                  boxShadow: userVote === 'dislike' 
                    ? '0 0 20px rgba(255,80,80,0.3)' 
                    : 'none'
                }}
                onMouseEnter={e => {
                  if (!isUpdating) {
                    e.currentTarget.style.background = userVote === 'dislike' 
                      ? 'rgba(255,80,80,0.4)' 
                      : 'rgba(255,80,80,0.15)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }
                }}
                onMouseLeave={e => {
                  if (!isUpdating) {
                    e.currentTarget.style.background = userVote === 'dislike' 
                      ? 'rgba(255,80,80,0.3)' 
                      : 'rgba(255,255,255,0.06)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }
                }}
              >
                <ThumbsDown size={20} /> {dislikes}
              </button>
              
              <span style={{
                color: 'rgba(255,255,255,0.4)',
                fontSize: '14px',
                fontStyle: 'italic',
                marginLeft: '8px'
              }}>
                {userVote ? `You ${userVote}d this product` : 'Help others by voting'}
              </span>
            </div>

            {/* Stock */}
            <div>
              <span style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: '600',
                background: product.stock > 5
                  ? 'rgba(0,200,100,0.15)'
                  : product.stock > 0
                  ? 'rgba(232,201,126,0.15)'
                  : 'rgba(255,80,80,0.15)',
                color: product.stock > 5
                  ? '#4ade80'
                  : product.stock > 0
                  ? '#E8C97E'
                  : '#f87171',
                border: `1px solid ${product.stock > 5
                  ? 'rgba(0,200,100,0.3)'
                  : product.stock > 0
                  ? 'rgba(232,201,126,0.3)'
                  : 'rgba(255,80,80,0.3)'}`
              }}>
                {product.stock > 5 ? t('product.in_stock') : product.stock > 0 ? `⚠ Only ${product.stock} left` : t('product.out_of_stock')}
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <p style={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: '15px',
                lineHeight: '1.7',
                fontWeight: '300',
                margin: 0
              }}>
                {product.description}
              </p>
            )}

            {/* Seller box */}
            {seller && (
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '20px',
                marginTop: '8px'
              }}>
                <span style={{
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em'
                }}>
                  {t('product.sold_by')}
                </span>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginTop: '10px'
                }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'rgba(0,78,100,0.4)',
                    border: '2px solid rgba(0,78,100,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#4DB8CC',
                    fontWeight: '700',
                    fontSize: '16px',
                    flexShrink: 0,
                    overflow: 'hidden'
                  }}>
                    {seller.avatar_url ? (
                      <img src={getImageUrl(seller.avatar_url)} alt={seller.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      (seller.name || seller.full_name || 'S').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <Link href={`/seller/${seller.id}`}>
                      <p style={{ color: '#4DB8CC', fontWeight: '700', cursor: 'pointer' }}>
                        {seller.name || seller.full_name}
                      </p>
                    </Link>
                    {seller.bio && (
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '2px 0 0 0' }}>
                        {seller.bio}
                      </p>
                    )}
                  </div>
                </div>

                {/* Contact info */}
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {seller.phone && (
                    <div>
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('product.phone')}</span>
                      <p style={{ color: 'white', fontSize: '14px', margin: '2px 0 0 0' }}>{seller.phone}</p>
                    </div>
                  )}
                  {seller.whatsapp && (
                    <div>
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('product.whatsapp')}</span>
                      <a href={`https://wa.me/${seller.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#4DB8CC', fontSize: '14px', display: 'block', marginTop: '2px' }}>{seller.whatsapp}</a>
                    </div>
                  )}
                  {seller.telegram && (
                    <div>
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('product.telegram')}</span>
                      <a href={`https://t.me/${seller.telegram.replace('@','')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#4DB8CC', fontSize: '14px', display: 'block', marginTop: '2px' }}>{seller.telegram}</a>
                    </div>
                  )}
                  {seller.facebook && (
                    <div>
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('product.facebook')}</span>
                      <a href={seller.facebook.startsWith('http') ? seller.facebook : `https://facebook.com/${seller.facebook}`} target="_blank" rel="noopener noreferrer" style={{ color: '#4DB8CC', fontSize: '14px', display: 'block', marginTop: '2px' }}>{seller.facebook}</a>
                    </div>
                  )}
                  {seller.instagram && (
                    <div>
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Instagram</span>
                      <a href={`https://instagram.com/${seller.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#4DB8CC', fontSize: '14px', display: 'block', marginTop: '2px' }}>{seller.instagram}</a>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
