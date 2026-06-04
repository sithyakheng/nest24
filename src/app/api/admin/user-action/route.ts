import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import cloudinary from '@/lib/cloudinary'
import rateLimit from '@/lib/rate-limit'

const limiter = rateLimit({ interval: 60 * 1000, uniqueTokenPerInterval: 500 })

const getIp = (req: NextRequest) => {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'
}

const parseCloudinaryPublicId = (url: string) => {
  const parts = url.split('/upload/')
  if (parts.length < 2) return null
  const afterUpload = parts[1]
  const publicId = afterUpload.replace(/\.[^/.]+$/, '')
  return publicId
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const ip = getIp(req)
    try {
      await limiter.check(20, `admin_action_${ip}`)
    } catch {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }

    const body = await req.json()
    const action = body?.action

    if (action === 'banUser') {
      const { userId, reason } = body
      if (!userId || typeof userId !== 'string') {
        return NextResponse.json({ error: 'Invalid user id for ban request' }, { status: 400 })
      }
      const banReason = typeof reason === 'string' && reason.trim().length > 0 ? reason.trim() : 'Violation of NestKH Terms of Service'
      const { error } = await supabase.from('profiles').update({ banned: true, ban_reason: banReason }).eq('id', userId)
      if (error) {
        return NextResponse.json({ error: 'Failed to ban user' }, { status: 500 })
      }
      return NextResponse.json({ success: true })
    }

    if (action === 'unbanUser') {
      const { userId } = body
      if (!userId || typeof userId !== 'string') {
        return NextResponse.json({ error: 'Invalid user id for unban request' }, { status: 400 })
      }
      const { error } = await supabase.from('profiles').update({ banned: false, ban_reason: null }).eq('id', userId)
      if (error) {
        return NextResponse.json({ error: 'Failed to unban user' }, { status: 500 })
      }
      return NextResponse.json({ success: true })
    }

    if (action === 'assignRank') {
      const { sellerId, selectedTier, selectedRank } = body
      if (!sellerId || typeof sellerId !== 'string') {
        return NextResponse.json({ error: 'Invalid seller id for rank assignment' }, { status: 400 })
      }
      if (typeof selectedTier !== 'number' || selectedTier < 0 || selectedTier > 3) {
        return NextResponse.json({ error: 'Invalid tier value' }, { status: 400 })
      }
      if (selectedRank !== null && typeof selectedRank !== 'string') {
        return NextResponse.json({ error: 'Invalid rank value' }, { status: 400 })
      }

      const { error } = await supabase.from('profiles').update({
        tier: selectedTier,
        rank: selectedRank,
        tier_forever: true,
        tier_expires_at: null
      }).eq('id', sellerId)

      if (error) {
        return NextResponse.json({ error: 'Failed to assign rank' }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    if (action === 'approveRankRequest') {
      const { requestId, rank, screenshotUrl } = body
      const rankStr = typeof rank === 'string' ? rank : ''
      const rankMap: Record<string, number> = { starter: 1, verified: 2, premium: 3 }
      const tier = rankMap[rankStr] || 1

      if (!requestId || typeof requestId !== 'string') {
        return NextResponse.json({ error: 'Invalid request id' }, { status: 400 })
      }

      const { data: requestData, error: requestError } = await supabase
        .from('rank_requests')
        .select('seller_id')
        .eq('id', requestId)
        .single()

      if (requestError || !requestData) {
        return NextResponse.json({ error: 'Rank request not found' }, { status: 404 })
      }

      const { error: profileError } = await supabase.from('profiles').update({
        rank: rankStr,
        tier,
        tier_forever: true,
        tier_expires_at: null
      }).eq('id', requestData.seller_id)

      if (profileError) {
        return NextResponse.json({ error: 'Failed to update seller profile' }, { status: 500 })
      }

      const { error: statusError } = await supabase.from('rank_requests').update({ status: 'approved' }).eq('id', requestId)
      if (statusError) {
        return NextResponse.json({ error: 'Failed to update rank request status' }, { status: 500 })
      }

      if (typeof screenshotUrl === 'string' && screenshotUrl.includes('cloudinary.com')) {
        const publicId = parseCloudinaryPublicId(screenshotUrl)
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId)
          } catch (destroyError) {
            console.error('Cloudinary destroy failed:', destroyError)
          }
        }
      }

      return NextResponse.json({ success: true })
    }

    if (action === 'rejectRankRequest') {
      const { requestId, screenshotUrl } = body
      if (!requestId || typeof requestId !== 'string') {
        return NextResponse.json({ error: 'Invalid request id' }, { status: 400 })
      }

      const { error } = await supabase.from('rank_requests').update({ status: 'rejected' }).eq('id', requestId)
      if (error) {
        return NextResponse.json({ error: 'Failed to reject rank request' }, { status: 500 })
      }

      if (typeof screenshotUrl === 'string' && screenshotUrl.includes('cloudinary.com')) {
        const publicId = parseCloudinaryPublicId(screenshotUrl)
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId)
          } catch (destroyError) {
            console.error('Cloudinary destroy failed:', destroyError)
          }
        }
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid admin action' }, { status: 400 })
  } catch (error: any) {
    console.error('Admin user action error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
