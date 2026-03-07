import { NextRequest, NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'

export async function POST(req: NextRequest) {
  try {
    console.log('Upload API called')
    console.log('Cloud name:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)
    console.log('API key:', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY)
    console.log('API secret exists:', !!process.env.CLOUDINARY_API_SECRET)

    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      console.log('No file provided')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log('File received:', file.name, file.size)

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataURI = `data:${file.type};base64,${base64}` 

    console.log('Uploading to Cloudinary...')

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'nestkh',
      transformation: [
        { width: 1200, crop: 'limit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    })

    console.log('Cloudinary upload success:', result.secure_url)

    return NextResponse.json({ 
      url: result.secure_url,
      public_id: result.public_id
    })

  } catch (error: any) {
    console.error('Cloudinary upload error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
