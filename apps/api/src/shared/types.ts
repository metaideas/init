import type { Database } from "@init/db/client"
import type { KeyValue } from "@init/kv/client"
import type { LoggerVariables } from "@init/observability/logger/hono"
import type { DeepMerge } from "@init/utils/type"
import type { Files } from "files-sdk"
import type { Auth, Session } from "#shared/auth.ts"
import type { Locale } from "#shared/internationalization/runtime.js"

export type AppContext = DeepMerge<
  LoggerVariables,
  {
    Variables: {
      auth: Auth
      db: Database
      files: Files
      kv: KeyValue
      language: Locale
    }
  }
>

export type AuthenticatedAppContext = DeepMerge<AppContext, { Variables: { session: Session } }>
