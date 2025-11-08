import type { Database } from "@init/db/client"
import type { KeyValue } from "@init/kv/client"
import type { Logger } from "@init/observability/logger"
import type { Auth } from "~/shared/auth"

export type AppContext = {
  Variables: {
    auth: Auth
    db: Database
    kv: KeyValue
    logger: Logger
  }
}
