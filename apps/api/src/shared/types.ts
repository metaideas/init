import type { Database } from "@init/db/client"
import type { KeyValue } from "@init/kv/client"
import type { getLogger } from "@init/observability/logger"
import type { Auth, Session } from "#shared/auth.ts"

type AppLogger = ReturnType<typeof getLogger>

export type AppContext = {
  Variables: {
    auth: Auth
    db: Database
    kv: KeyValue
    logger: AppLogger
    session: Session | null
  }
}
