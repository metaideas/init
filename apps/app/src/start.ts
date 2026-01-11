import { createStart } from "@tanstack/react-start"
import { faultSerializer } from "#shared/server/serialization.ts"

export const startInstance = createStart(() => ({
  functionMiddleware: [],
  requestMiddleware: [],
  serializationAdapters: [faultSerializer],
}))
