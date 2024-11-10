import { createClient as createMobileClient } from "@supabase/supabase-js"
import env from "@this/env/supabase.mobile"

import type { Database } from "#types/database.ts"

export function createClient() {
  return createMobileClient<Database>(
    env.EXPO_PUBLIC_SUPABASE_URL,
    env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  )
}
