import "#instrument.ts"

import app from "#routes/index.ts"
import env from "#shared/env.ts"
import { security } from "#shared/security.ts"

export default {
  port: env.PORT,
  fetch: security.handler(app.fetch),
} satisfies Bun.Serve.Options<unknown>
