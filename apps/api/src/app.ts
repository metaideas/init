import { Hono } from "hono"
import { contextStorage } from "hono/context-storage"
import { cors } from "hono/cors"
import { HTTPException } from "hono/http-exception"
import { logger } from "hono/logger"

import { captureException } from "@init/observability/error/node"
import { logger as customLogger } from "@init/observability/logger"

import authRouter from "~/routes/auth"
import healthRouter from "~/routes/health"
import testRouter from "~/routes/test"
import trpcRouter from "~/routes/trpc"
import type { AppContext } from "~/shared/types"

const app = new Hono<AppContext>()

app.use(cors({ credentials: true, origin: "*" }))
app.use(logger((message, ...rest) => customLogger.info(rest, message)))
app.use(contextStorage())

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

app.use(async (c, next) => {
  // Load dependencies into the application context
  await Promise.all([
    import("~/shared/auth").then(({ auth }) => c.set("auth", auth)),

    import("@init/db/client").then(({ default: db }) => c.set("db", db)),
    import("@init/observability/logger").then(({ logger }) =>
      c.set("logger", logger)
    ),
  ])

  await next()
})

export const router = app
  .get("/ping", c => c.text(Date.now().toString()))
  .route("/health", healthRouter)
  .route("/auth", authRouter)
  .route("/test", testRouter)
  .route("/trpc", trpcRouter)

export default app
