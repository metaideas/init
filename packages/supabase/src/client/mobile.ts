import "react-native-url-polyfill/auto"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import env from "@this/env/supabase/client"

import type { Database } from "#types/database.ts"

export function createClient() {
  return createSupabaseClient<Database>(
    env.PUBLIC_SUPABASE_URL,
    env.PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    }
  )
}
