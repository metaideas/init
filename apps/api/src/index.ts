import "#instrument.ts"

import app from "#routes/index.ts"
import env from "#shared/env.ts"
import { security } from "#shared/security.ts"

export default {
  fetch: security.handler(app.fetch),
  port: env.PORT,
} satisfies Bun.Serve.Options<unknown>
