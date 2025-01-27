import type { auth } from "@this/auth/server"
import type { db } from "@this/db/client"
import type { queue } from "@this/queue/client"

export type AppContext = {
  Bindings: CloudflareBindings
  Variables: { queue: typeof queue; auth: typeof auth; db: typeof db }
}
