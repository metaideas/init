import { ensureEnv } from "@this/env/helpers"
import { Hono } from "hono"
import { contextStorage } from "hono/context-storage"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import type { AppContext } from "~/lib/types"

// Routers
import authRouter from "~/routes/auth"
import queuesRouter from "~/routes/queues"
import testRouter from "~/routes/test"
import trpcRouter from "~/routes/trpc"

const app = new Hono<AppContext>()

app.use(cors({ origin: ["http://localhost:3000"], credentials: true }))
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

  // Ensure environment variables are set
  const { default: authServer } = await import("@this/env/auth.server")
  const { default: dbServer } = await import("@this/env/db.server")

  ensureEnv([authServer, dbServer], { env: c.env })

  // Load dependencies into the application context
  const { auth } = await import("@this/auth/server")
  const { db } = await import("@this/db/client")
  const { queue } = await import("@this/queue/client")
  const { logger } = await import("@this/observability/logger")

  c.set("auth", auth)
  c.set("db", db)
  c.set("queue", queue)
  c.set("logger", logger)

  await next()
})

export const appRouter = app
  .get("/ping", c => c.text(Date.now().toString()))
  .route("/auth", authRouter)
  .route("/queues", queuesRouter)
  .route("/test", testRouter)
  .route("/trpc", trpcRouter)

export default app
