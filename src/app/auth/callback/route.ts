import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const errorDescription = searchParams.get('error_description')

  if (errorDescription) {
    console.error('OAuth callback error:', errorDescription)
    return NextResponse.redirect(new URL(`/login`, request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.session || !data.user) {
    console.error('OAuth exchange error:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const user = data.user
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    const role = (user.user_metadata as any)?.role || 'buyer'
    await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      full_name: (user.user_metadata as any)?.full_name || user.user_metadata?.name || '',
      name: (user.user_metadata as any)?.full_name || user.user_metadata?.name || '',
      role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
  } else if (profileError) {
    console.error('Profile lookup error:', profileError)
  }

  return NextResponse.redirect(new URL('/', request.url))
}
