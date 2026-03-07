import { NextRequest, NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { public_id } = body
    console.log('Delete route called with public_id:', public_id)
    
    if (!public_id) {
      return NextResponse.json({ error: 'No public_id provided' }, { status: 400 })
    }

    const result = await cloudinary.uploader.destroy(public_id)
    console.log('Cloudinary destroy result:', result)
    
    return NextResponse.json({ success: true, result })
  } catch (error: any) {
    console.error('Delete route error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
