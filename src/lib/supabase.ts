import { createBrowserClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )
  }
  return _supabase
}

// Intercept auth methods on the server to dynamically read server cookies
const authServerHandler = {
  async getUser() {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const { createServerClient } = await import('@supabase/ssr')
    const serverClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          }
        }
      }
    )
    return serverClient.auth.getUser()
  },
  async getSession() {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const { createServerClient } = await import('@supabase/ssr')
    const serverClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          }
        }
      }
    )
    return serverClient.auth.getSession()
  }
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (prop === 'auth' && typeof window === 'undefined') {
      // On the server, return our proxy for auth that automatically handles cookies
      return new Proxy((getSupabase() as any).auth, {
        get(authTarget, authProp) {
          if (authProp === 'getUser') {
            return authServerHandler.getUser
          }
          if (authProp === 'getSession') {
            return authServerHandler.getSession
          }
          return (authTarget as any)[authProp]
        }
      })
    }
    return (getSupabase() as any)[prop]
  }
})

export async function createClient() {
  if (typeof window === 'undefined') {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const { createServerClient } = await import('@supabase/ssr')
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore
            }
          },
        },
      }
    )
  }
  return getSupabase()
}
