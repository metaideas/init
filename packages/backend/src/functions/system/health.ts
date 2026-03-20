import { internalQuery } from "#functions/shared/convex.ts"

export const ping = internalQuery
  .handler(() => Promise.resolve({ ok: true, timestamp: Date.now() }))
  .internal()
