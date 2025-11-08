import "~/instrument"

import app from "~/routes"
import env from "~/shared/env"

export default {
  port: env.PORT,
  fetch: app.fetch,
} satisfies Bun.Serve.Options<unknown>
