import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    // Only authenticated users can validate discount codes
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ valid: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { code } = body

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false }, { status: 400 })
    }

    const validCode = process.env.DISCOUNT_CODE
    const isValid = validCode ? code.trim().toUpperCase() === validCode.trim().toUpperCase() : false

    return NextResponse.json({ valid: isValid })
  } catch {
    return NextResponse.json({ valid: false, error: 'Something went wrong.' }, { status: 500 })
  }
}
