import type { SupabaseClient as BaseSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "./database"

export type SupabaseClient = BaseSupabaseClient<Database>

export * from "./database"
