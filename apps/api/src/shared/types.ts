import type { Database } from "@init/database/client"
import type { DeepMerge } from "@init/utils/type"
import type { EvlogVariables } from "evlog/hono"
import type { Files } from "files-sdk"
import type { Storage } from "unstorage"
import type { Locale } from "#shared/internationalization/runtime.js"
import type { Auth, Session } from "#shared/services.ts"

export type AppContext = DeepMerge<
  EvlogVariables,
  {
    Variables: {
      auth: Auth
      db: Database
      files: Files
      kv: Storage
      language: Locale
    }
  }
>

export type AuthenticatedAppContext = DeepMerge<AppContext, { Variables: { session: Session } }>
