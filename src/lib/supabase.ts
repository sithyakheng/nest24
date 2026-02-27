import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oisdppgqifhbtlanglwr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pc2RwcGdxaWZoYnRsYW5nbHdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMDk2NTYsImV4cCI6MjA4NzY4NTY1Nn0.Wmf6-Ze8BrCFAEaC9OoqWmMrXas_oFMgr9ZFpYgi3f0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Service role client for admin operations (bypasses RLS)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
