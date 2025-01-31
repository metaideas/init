import { Hono } from "hono"
import { contextStorage } from "hono/context-storage"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import type { AppContext } from "~/lib/types"

// Routers
import authRouter from "~/routes/auth"
import healthRouter from "~/routes/health"
import queuesRouter from "~/routes/queues"
import testRouter from "~/routes/test"
import trpcRouter from "~/routes/trpc"

const app = new Hono<AppContext>()

app.use(cors({ origin: "*", credentials: true }))
app.use(logger())
app.use(contextStorage())

app.use(async (c, next) => {
  // Copy environment variables from c.env to process.env, since `@this/env`
  // expects process.env to be set
  for (const [key, value] of Object.entries(c.env)) {
    // If value is not a string, it's not an environment variable
    if (typeof value !== "string") {
      continue
    }

    // Only set the environment variable if it's not already set
    process.env[key] ??= value
  }

  // Load dependencies into the application context
  await Promise.all([
    import("@this/auth/server").then(({ auth }) => c.set("auth", auth)),
    import("@this/db/client").then(({ db }) => c.set("db", db)),
    import("@this/queue/client").then(({ queue }) => c.set("queue", queue)),
    import("@this/observability/logger").then(({ logger }) =>
      c.set("logger", logger)
    ),
  ])

  await next()
})

export const appRouter = app
  .get("/ping", c => c.text(Date.now().toString()))
  .route("/auth", authRouter)
  .route("/health", healthRouter)
  .route("/queues", queuesRouter)
  .route("/test", testRouter)
  .route("/trpc", trpcRouter)

export default app
