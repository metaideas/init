import "#instrument.ts"

import app from "#routes/index.ts"
import env from "#shared/env.ts"

export default {
  fetch: app.fetch,
  port: env.PORT,
} satisfies Bun.Serve.Options<unknown>
