import type { db } from "@init/db"
import type { logger } from "@init/observability/logger"

import type { auth } from "~/shared/auth"

export type AppContext = {
  Bindings: Env
  Variables: {
    auth: typeof auth
    db: typeof db
    logger: typeof logger
  }
}
