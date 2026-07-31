import type { Database } from "@init/db/client"
import type { KeyValue } from "@init/kv/client"
import type { DeepMerge } from "@init/utils/type"
import type { Auth, Session } from "#shared/auth.ts"
import type { Locale } from "#shared/internationalization/runtime.js"
import type { logger } from "#shared/logger.ts"

type AppLogger = typeof logger

export type AppContext = {
  Variables: {
    auth: Auth
    db: Database
    kv: KeyValue
    language: Locale
    logger: AppLogger
  }
}

export type AuthenticatedAppContext = DeepMerge<AppContext, { Variables: { session: Session } }>
