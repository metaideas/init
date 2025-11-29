import { createStart } from "@tanstack/react-start"
import { errorSerializer } from "#shared/server/serialization.ts"

export const startInstance = createStart(() => ({
  functionMiddleware: [],
  requestMiddleware: [],
  serializationAdapters: [errorSerializer],
}))
