import type { db } from "@this/db"
import type { kv } from "@this/kv"
import type { logger } from "@this/observability/logger"

import type { auth } from "~/shared/auth"

export type AppContext = {
  Bindings: Env
  Variables: {
    auth: typeof auth
    db: typeof db
    kv: typeof kv
    logger: typeof logger
  }
}
