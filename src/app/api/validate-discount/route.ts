import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {


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
