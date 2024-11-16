import { createBrowserClient } from "@supabase/ssr"
import env from "@this/env/supabase/client"

import type { Database } from "#types/database.ts"

export function createClient() {
  return createBrowserClient<Database>(
    env.PUBLIC_SUPABASE_URL,
    env.PUBLIC_SUPABASE_ANON_KEY
  )
}
