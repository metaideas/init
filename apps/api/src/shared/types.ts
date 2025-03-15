import type { db } from "@this/db"
import type { logger } from "@this/observability/logger"

import type { auth } from "~/shared/auth"

export type AppContext = {
  Bindings: Env
  Variables: {
    auth: typeof auth
    db: typeof db
    logger: typeof logger
  }
}
