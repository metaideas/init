import { createBrowserClient } from "@supabase/ssr"
import env from "@this/env/supabase.web"

import type { Database } from "#types/database.ts"

export function createClient() {
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
