import type { Database } from "@init/db/client"
import type { KeyValue } from "@init/kv/client"
import type { Auth } from "#shared/auth.ts"
import type { logger } from "#shared/logger.ts"

type AppLogger = typeof logger

export type AppContext = {
  Variables: {
    auth: Auth
    db: Database
    kv: KeyValue
    logger: AppLogger
  }
}
