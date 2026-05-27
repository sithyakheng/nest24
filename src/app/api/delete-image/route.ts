import { NextRequest, NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'
import { createClient } from '@/lib/supabase'
import rateLimit from '@/lib/rate-limit'

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
})

export async function POST(req: NextRequest) {
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

  if (profileError || !profile || !['seller', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    // Rate limiting: 20 deletes per minute per IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'
    try {
      await limiter.check(20, `delete_${ip}`)
    } catch {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }



    const body = await req.json()
    const { public_id } = body
    
    if (!public_id || typeof public_id !== 'string') {
      return NextResponse.json({ error: 'Invalid public_id provided' }, { status: 400 })
    }

    // Prevent deletion of arbitrary Cloudinary resources by limiting to the application folder
    if (!public_id.startsWith('nestkh/')) {
      return NextResponse.json({ error: 'Invalid public_id format' }, { status: 400 })
    }

    // Basic CSRF check - ensure the request is from our own domain
    const origin = req.headers.get('origin')
    const host = req.headers.get('host')
    if (origin && !origin.includes(host || '')) {
      return NextResponse.json({ error: 'CSRF Protection: Invalid origin' }, { status: 403 })
    }

    await cloudinary.uploader.destroy(public_id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete route error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
