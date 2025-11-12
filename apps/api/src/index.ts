import "~/instrument"

import app from "~/routes"
import env from "~/shared/env"
import { security } from "~/shared/security"

export default {
  port: env.PORT,
  fetch: security.handler(app.fetch),
} satisfies Bun.Serve.Options<unknown>
