import { internalQuery } from "#functions/shared/convex.ts"

export const ping = internalQuery
  .handler(
    // oxlint-disable-next-line typescript/require-await -- fluent-convex query handlers require promises.
    async () => ({ ok: true, timestamp: Date.now() })
  )
  .internal()
