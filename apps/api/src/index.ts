import "#instrument.ts"

import app from "#routes/index.ts"
import { ENV } from "#shared/env.generated.ts"

export default {
  fetch: app.fetch,
  port: ENV.PORT,
} satisfies Bun.Serve.Options<unknown>
