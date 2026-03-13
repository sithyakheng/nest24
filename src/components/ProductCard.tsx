'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ThumbsUp, ThumbsDown } from 'lucide-react'

interface ProductCardProps {
  product: any
}

const getImageUrl = (url: string): string => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `https://oisdppgqifhbtlanglwr.supabase.co/storage/v1/object/public/Product/${url}` 
}

export default function ProductCard({ product }: ProductCardProps) {
  const [windowWidth, setWindowWidth] = useState(1200)
  const [likes, setLikes] = useState(product.likes || 0)
  const [dislikes, setDislikes] = useState(product.dislikes || 0)
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
    // Load user's vote from localStorage
    const savedVote = localStorage.getItem(`product_vote_${product.id}`)
    if (savedVote) {
      setUserVote(savedVote as 'like' | 'dislike')
    }
  }, [product.id])

  const handleVote = async (voteType: 'like' | 'dislike') => {
    if (isUpdating) return

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
        localStorage.removeItem(`product_vote_${product.id}`)
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
        localStorage.setItem(`product_vote_${product.id}`, voteType)
      }

      // Update Supabase
      const { error } = await supabase
        .from('products')
        .update({
          likes: newLikes,
          dislikes: newDislikes
        })
        .eq('id', product.id)

      if (error) {
        console.error('Error updating vote:', error)
        // Revert state on error
        setLikes(likes)
        setDislikes(dislikes)
        setUserVote(previousVote)
        if (previousVote) {
          localStorage.setItem(`product_vote_${product.id}`, previousVote)
        } else {
          localStorage.removeItem(`product_vote_${product.id}`)
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

  console.log('Product profiles rank:', product.profiles?.rank)
  
  // Determine rank-based styling
  const getRankStyle = () => {
    const rank = product.profiles?.rank
    if (rank === 'premium') {
      return {
        border: '2px solid rgba(232,201,126,0.5)',
        boxShadow: '0 0 30px rgba(232,201,126,0.15)',
        sellerColor: '#E8C97E',
        badgeBg: 'rgba(232,201,126,0.4)',
        badgeBorder: 'rgba(232,201,126,0.6)',
        badgeColor: '#E8C97E',
        badgeIcon: '⭐'
      }
    } else if (rank === 'verified') {
      return {
        border: '2px solid rgba(0,78,100,0.5)',
        boxShadow: '0 0 20px rgba(0,78,100,0.15)',
        sellerColor: '#4DB8CC',
        badgeBg: 'rgba(0,78,100,0.5)',
        badgeBorder: 'rgba(0,78,100,0.7)',
        badgeColor: '#4DB8CC',
        badgeIcon: '✓'
      }
    } else if (rank === 'starter') {
      return {
        border: '2px solid rgba(59,130,246,0.3)',
        boxShadow: '0 0 15px rgba(59,130,246,0.1)',
        sellerColor: '#93c5fd',
        badgeBg: 'rgba(59,130,246,0.4)',
        badgeBorder: 'rgba(59,130,246,0.6)',
        badgeColor: '#93c5fd',
        badgeIcon: '🥉'
      }
    } else {
      return {
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: 'none',
        sellerColor: 'rgba(255,255,255,0.4)',
        badgeBg: 'rgba(255,255,255,0.06)',
        badgeBorder: 'rgba(255,255,255,0.12)',
        badgeColor: 'rgba(255,255,255,0.6)',
        badgeIcon: ''
      }
    }
  }

  const rankStyle = getRankStyle()
  
  return (
    <Link href={`/products/${product.id}`}>
      <div
        style={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: rankStyle.border,
          borderTop: '1px solid rgba(255,255,255,0.22)',
          borderRadius: '20px',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          position: 'relative',
          boxShadow: rankStyle.boxShadow
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = rankStyle.boxShadow ? rankStyle.boxShadow.replace('0 0', '0 8px') : '0 8px rgba(0,0,0,0.4)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = rankStyle.boxShadow
        }}
      >
        <div style={{ height: '160px', overflow: 'hidden', background: 'rgba(255,255,255,0.04)', position: 'relative' }}>
          {product.image_url ? (
            <img
              src={getImageUrl(product.image_url)}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '14px' }}>
              No Image
            </div>
          )}

          {/* Discount tag top left */}
          {product.compare_price && Number(product.compare_price) > Number(product.price) && (
            <div style={{
              position: 'absolute',
              top: '0px',
              left: '0px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              fontSize: '10px',
              padding: '12px 12px',
              borderRadius: '0 0 12px 0',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 4px 12px rgba(239,68,68,0.4)'
            }}>
              🏷️ {Math.round((1 - Number(product.price) / Number(product.compare_price)) * 100)}% OFF
            </div>
          )}

          {/* Rank Badge - Top Right */}
          {product.profiles?.rank && (
            <span style={{ 
              position: 'absolute', 
              top: '8px', 
              right: '8px', 
              background: rankStyle.badgeBg, 
              border: `1px solid ${rankStyle.badgeBorder}`, 
              color: rankStyle.badgeColor, 
              fontSize: '10px', 
              padding: '4px 10px',
              fontWeight: '700', 
              borderRadius: '9999px', 
              backdropFilter: 'blur(8px)', 
              WebkitBackdropFilter: 'blur(8px)' 
            }}>
              {rankStyle.badgeIcon} {product.profiles.rank.charAt(0).toUpperCase() + product.profiles.rank.slice(1)}
            </span>
          )}
        </div>

        <div style={{ padding: isMobile ? '12px' : '16px' }}>
          <span style={{ color: '#4DB8CC', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600' }}>
            {product.category}
          </span>
          <p style={{ color: '#1f2937', fontWeight: '600', fontSize: '13px', margin: '6px 0', lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.name}
          </p>
          <div style={{ marginBottom: '8px' }}>
          {product.compare_price && Number(product.compare_price) > Number(product.price) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <p style={{ 
                color: 'rgba(255,255,255,0.35)', 
                fontSize: isMobile ? '11px' : '13px', 
                margin: 0, 
                textDecoration: 'line-through' 
              }}>
                ${product.compare_price}
              </p>
              <span style={{
                background: 'linear-gradient(135deg, #f87171, #ef4444)',
                color: 'white',
                fontSize: '10px',
                fontWeight: '900',
                padding: isMobile ? '4px 8px' : '6px 12px',
                borderRadius: '9999px'
              }}>
                -{Math.round((1 - Number(product.price) / Number(product.compare_price)) * 100)}% OFF
              </span>
            </div>
          )}
          <p style={{ color: '#004E64', fontWeight: '900', fontSize: '16px', margin: 0 }}>
            ${product.price}
          </p>
        </div>
        
        {/* Like/Dislike Buttons */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          marginBottom: '12px',
          padding: '8px 0' 
        }}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              handleVote('like')
            }}
            disabled={isUpdating}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 10px',
              borderRadius: '8px',
              border: userVote === 'like' ? '1px solid rgba(0,78,100,0.6)' : '1px solid rgba(255,255,255,0.12)',
              background: userVote === 'like' 
                ? 'rgba(0,78,100,0.3)' 
                : 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              color: userVote === 'like' ? '#4DB8CC' : 'rgba(255,255,255,0.7)',
              cursor: isUpdating ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              opacity: isUpdating ? 0.6 : 1
            }}
            onMouseEnter={e => {
              if (!isUpdating) {
                e.currentTarget.style.background = userVote === 'like' 
                  ? 'rgba(0,78,100,0.4)' 
                  : 'rgba(0,78,100,0.15)'
              }
            }}
            onMouseLeave={e => {
              if (!isUpdating) {
                e.currentTarget.style.background = userVote === 'like' 
                  ? 'rgba(0,78,100,0.3)' 
                  : 'rgba(255,255,255,0.06)'
              }
            }}
          >
            <ThumbsUp size={16} /> {likes}
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              handleVote('dislike')
            }}
            disabled={isUpdating}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 10px',
              borderRadius: '8px',
              border: userVote === 'dislike' ? '1px solid rgba(255,80,80,0.6)' : '1px solid rgba(255,255,255,0.12)',
              background: userVote === 'dislike' 
                ? 'rgba(255,80,80,0.3)' 
                : 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              color: userVote === 'dislike' ? '#f87171' : 'rgba(255,255,255,0.7)',
              cursor: isUpdating ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              opacity: isUpdating ? 0.6 : 1
            }}
            onMouseEnter={e => {
              if (!isUpdating) {
                e.currentTarget.style.background = userVote === 'dislike' 
                  ? 'rgba(255,80,80,0.4)' 
                  : 'rgba(255,80,80,0.15)'
              }
            }}
            onMouseLeave={e => {
              if (!isUpdating) {
                e.currentTarget.style.background = userVote === 'dislike' 
                  ? 'rgba(255,80,80,0.3)' 
                  : 'rgba(255,255,255,0.06)'
              }
            }}
          >
            <ThumbsDown size={16} /> {dislikes}
          </button>
        </div>
        
        <Link 
          href={`/seller/${product.profiles?.id}`}
          onClick={(e) => e.stopPropagation()}
        >
          <span style={{ 
            fontSize: '12px', 
            color: '#46ABB8',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            textDecoration: 'none',
            cursor: 'pointer'
          }}>
            {product.profiles?.name || product.profiles?.full_name || 'View Shop'}
          </span>
        </Link>
        </div>
      </div>
    </Link>
  )
}
