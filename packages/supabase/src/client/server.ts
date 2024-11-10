import { createServerClient } from "@supabase/ssr"
import env from "@this/env/supabase.server"
import { cookies } from "next/headers"

import type { Database } from "#types/database.ts"

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch (_error) {}
      },
    },
  })
}
