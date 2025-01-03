import type { db } from "@this/db/client"

export type AppContext = {
  Bindings: CloudflareBindings
  Variables: { db: typeof db }
}
