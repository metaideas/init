import { Hono } from "hono"
import { contextStorage } from "hono/context-storage"
import { cors } from "hono/cors"
import { HTTPException } from "hono/http-exception"
import { logger as honoLogger } from "hono/logger"

import { database } from "@init/db/client"
import { redis } from "@init/kv/client"
import { captureException } from "@init/observability/error/server"
import { logger } from "@init/observability/logger"

import { auth } from "~/shared/auth"
import type { AppContext } from "~/shared/types"

// Routing
import authRoutes from "~/app/auth"
import healthRoutes from "~/app/health"
import testRoutes from "~/app/test"
import trpcRoutes from "~/app/trpc"

const app = new Hono<AppContext>()

app.use(cors({ credentials: true, origin: "*" }))
app.use(honoLogger((message, ...rest) => logger.info(rest, message)))
app.use(contextStorage())

// Add context dependencies
app.use(async (c, next) => {
  const db = database()
  const kv = redis()

  c.set("auth", auth)
  c.set("db", db)
  c.set("kv", kv)
  c.set("logger", logger)

  await next()
})

app.onError((err, c) => {
  // If the error is a HTTPException (for example, an authorization failure),
  // return the custom response
  if (err instanceof HTTPException) {
    return err.getResponse()
  }

  // Capture the exception in monitoring
  captureException(err)

  return c.text("Internal Server Error", 500)
})

export const router = app
  .get("/ping", c => c.text(Date.now().toString()))
  .route("/auth", authRoutes)
  .route("/health", healthRoutes)
  .route("/test", testRoutes)
  .route("/trpc", trpcRoutes)

export default app
