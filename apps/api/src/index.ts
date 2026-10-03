import "#instrument.ts"
import type { Serve } from "bun"
import { flushLogs } from "#shared/logger.ts"

import app from "#routes/index.ts"
import { ENV } from "#shared/env.generated.ts"
import { workflows } from "#shared/workflows.ts"

await workflows.launch()

async function shutdown() {
  await workflows.shutdown()
  await flushLogs()
  process.exit(0)
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    void shutdown()
  })
}

export default {
  fetch: app.fetch,
  port: ENV.PORT,
} satisfies Serve.Options<unknown>
