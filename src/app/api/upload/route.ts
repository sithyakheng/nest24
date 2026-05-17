import { NextRequest, NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'
import { supabase } from '@/lib/supabase'
import { isValidImageType, validateFileSignature } from '@/lib/security'
import rateLimit from '@/lib/rate-limit'

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
})

export async function POST(req: NextRequest) {
  try {
    // Rate limiting: 10 uploads per minute per IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'
    try {
      await limiter.check(10, `upload_${ip}`)
    } catch {
      return NextResponse.json({ error: 'Too many upload requests. Please try again in a minute.' }, { status: 429 })
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Strict file extension check
    const forbiddenExtensions = ['.exe', '.php', '.js', '.html', '.svg', '.sh', '.bat'];
    const fileName = file.name.toLowerCase();
    if (forbiddenExtensions.some(ext => fileName.endsWith(ext))) {
      return NextResponse.json({ error: 'File type not allowed.' }, { status: 400 })
    }

    // File type validation (MIME type)
    if (!isValidImageType(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPG, PNG, GIF and WebP are allowed.' }, { status: 400 })
    }

    // File size validation (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size too large. Max 5MB allowed.' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Magic bytes validation
    if (!validateFileSignature(buffer)) {
      return NextResponse.json({ error: 'Invalid file signature. This file is not a valid image.' }, { status: 400 })
    }



    const base64 = buffer.toString('base64')
    const dataURI = `data:${file.type};base64,${base64}` 



    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'nestkh',
      transformation: [
        { width: 1200, crop: 'limit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    })



    return NextResponse.json({ 
      url: result.secure_url,
      public_id: result.public_id
    })

  } catch (error: any) {
    console.error('Cloudinary upload error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
