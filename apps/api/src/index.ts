import type { Serve } from "bun"

import "~/instrument"

import app from "~/app"
import env from "~/shared/env"

export default {
  port: env.PORT,
  fetch: app.fetch,
} satisfies Serve
