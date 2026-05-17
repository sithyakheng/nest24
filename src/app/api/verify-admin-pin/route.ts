import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

// In-memory store for tracking failed attempts
// Key: userId (string)
// Value: { count: number, lockedUntil: number }
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>()

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id

    // Check if locked out
    const attemptInfo = loginAttempts.get(userId)
    const now = Date.now()
    if (attemptInfo && attemptInfo.count >= 3) {
      if (now < attemptInfo.lockedUntil) {
        const remainingSeconds = Math.ceil((attemptInfo.lockedUntil - now) / 1000)
        const remainingMinutes = Math.ceil(remainingSeconds / 60)
        return NextResponse.json({ 
          error: `Locked out. Try again in ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}.`,
          lockedOut: true,
          lockedUntil: attemptInfo.lockedUntil
        }, { status: 423 })
      } else {
        // Lockout expired, reset attempts
        loginAttempts.delete(userId)
      }
    }

    // Check if user has admin role in profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 })
    }

    // Get pin from body
    const body = await req.json()
    const { pin } = body

    if (!pin || typeof pin !== 'string' || pin.length !== 6) {
      return NextResponse.json({ error: 'Invalid PIN format. Must be 6 characters.' }, { status: 400 })
    }

    const correctPin = process.env.ADMIN_PIN

    if (!correctPin) {
      console.error('ADMIN_PIN environment variable is not defined!')
      return NextResponse.json({ error: 'Server configuration error. Please contact the administrator.' }, { status: 500 })
    }

    if (pin === correctPin) {
      // Success: reset attempts
      loginAttempts.delete(userId)
      return NextResponse.json({ success: true })
    } else {
      // Failed attempt
      const currentAttempts = loginAttempts.get(userId)
      const count = (currentAttempts ? currentAttempts.count : 0) + 1
      let lockedUntil = 0
      
      if (count >= 3) {
        lockedUntil = Date.now() + 5 * 60 * 1000 // 5 minutes lockout
      }

      loginAttempts.set(userId, { count, lockedUntil })

      if (count >= 3) {
        return NextResponse.json({ 
          error: 'Too many failed attempts. Locked out for 5 minutes.',
          lockedOut: true,
          lockedUntil
        }, { status: 423 })
      }

      const remainingAttempts = 3 - count
      return NextResponse.json({ 
        error: `Incorrect PIN. ${remainingAttempts} attempt${remainingAttempts > 1 ? 's' : ''} remaining.`,
        remainingAttempts
      }, { status: 400 })
    }

  } catch (error: any) {
    console.error('Verify PIN route error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
