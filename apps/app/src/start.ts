import { createStart } from "@tanstack/react-start"
import { withCsrf, withWideEvent } from "#shared/server/middleware.ts"
import { faultSerializer } from "#shared/server/serialization.ts"

export const startInstance = createStart(() => ({
  functionMiddleware: [],
  requestMiddleware: [withWideEvent, withCsrf],
  serializationAdapters: [faultSerializer],
}))
