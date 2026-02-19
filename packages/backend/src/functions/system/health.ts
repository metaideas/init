import { internalQuery } from "#functions/shared/convex.ts"

export const ping = internalQuery
  .handler(async () => ({ ok: true, timestamp: Date.now() }))
  .internal()
