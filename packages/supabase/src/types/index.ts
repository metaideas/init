import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "./database"

export type Client = SupabaseClient<Database>

export * from "./database"
