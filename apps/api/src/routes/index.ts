import { Hono } from "hono"
import { contextStorage } from "hono/context-storage"
import { cors } from "hono/cors"
import { logger } from "hono/logger"

import authRouter from "~/routes/auth"
import testRouter from "~/routes/test"
import trpcRouter from "~/routes/trpc"
import type { AppContext } from "~/shared/types"

// Import this file to ensure that all environment variables are set
import "~/shared/env"

const app = new Hono<AppContext>()

app.use(cors({ credentials: true, origin: "*" }))
app.use(logger())
app.use(contextStorage())

app.use(async (c, next) => {
  // Load dependencies into the application context
  await Promise.all([
    import("@this/auth/server").then(({ auth }) => c.set("auth", auth)),
    import("@this/db").then(({ db }) => c.set("db", db)),
    import("@this/kv").then(({ kv }) => c.set("kv", kv)),
    import("@this/observability/logger").then(({ logger }) =>
      c.set("logger", logger)
    ),
  ])

  await next()
})

export const router = app
  .get("/ping", c => c.text(Date.now().toString()))
  .route("/auth", authRouter)
  .route("/test", testRouter)
  .route("/trpc", trpcRouter)

export default app
