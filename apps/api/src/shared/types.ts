import type { Database } from "@init/db/client"
import type { logger } from "@init/observability/logger"

import type { Auth } from "~/shared/auth"

export type AppContext = {
  Variables: {
    auth: Auth
    db: Database
    logger: typeof logger
  }
}
