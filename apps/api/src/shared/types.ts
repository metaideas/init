import type { auth } from "@this/auth/server"
import type { db } from "@this/db"
import type { kv } from "@this/kv"
import type { logger } from "@this/observability/logger"

export type AppContext = {
  Bindings: CloudflareBindings
  Variables: {
    auth: typeof auth
    db: typeof db
    kv: typeof kv
    logger: typeof logger
  }
}
