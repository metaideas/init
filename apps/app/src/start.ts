import { createStart } from "@tanstack/react-start"
import { withCsrf } from "#shared/server/middleware.ts"
import { faultSerializer } from "#shared/server/serialization.ts"

export const startInstance = createStart(() => ({
  functionMiddleware: [],
  requestMiddleware: [withCsrf],
  serializationAdapters: [faultSerializer],
}))
