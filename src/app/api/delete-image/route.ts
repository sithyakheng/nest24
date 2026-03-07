import { NextRequest, NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'

export async function POST(req: NextRequest) {
  try {
    const { public_id } = await req.json()
    console.log('Deleting from Cloudinary:', public_id)
    const result = await cloudinary.uploader.destroy(public_id)
    console.log('Delete result:', result)
    return NextResponse.json({ success: true, result })
  } catch (error: any) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
