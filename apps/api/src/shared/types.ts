import type { Database } from "@init/db/client"
import type { KeyValue } from "@init/kv/client"
import type { Logger } from "@init/observability/logger"
import type { Auth, Session } from "#shared/auth.ts"
import type { Security } from "#shared/security.ts"

export type AppContext = {
  Variables: {
    auth: Auth
    db: Database
    kv: KeyValue
    logger: Logger
    security: Security
    session: Session | null
  }
}
