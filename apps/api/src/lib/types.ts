import type { auth } from "@this/auth/server"
import type { db } from "@this/db"
import type { logger } from "@this/observability/logger"
import type { queue } from "@this/queue/client"

export type AppContext = {
  Bindings: CloudflareBindings
  Variables: {
    auth: typeof auth
    db: typeof db
    logger: typeof logger
    queue: typeof queue
  }
}
