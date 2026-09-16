// Database client initialization
// This file will be populated with types from supabase gen types after migrations are applied
import { createClient } from '@supabase/supabase-js'
import type { Database } from './db.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create client with dummy values if not configured (for build-time compatibility)
// This will fail at runtime if not configured, but allows build to complete
const defaultUrl = 'https://placeholder.supabase.co'
const defaultKey = 'placeholder-key'

export const supabase = createClient<Database>(
  (supabaseUrl || defaultUrl) as string,
  (supabaseAnonKey || defaultKey) as string
)

// Server-side client with service role key (for admin operations)
export function getServiceRoleClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for server operations')
  }

  return createClient<Database>(
    (supabaseUrl || defaultUrl) as string,
    serviceRoleKey
  )
}
