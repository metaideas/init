import { database } from "@init/db/client"
import { kv } from "@init/kv/client"
import { logger } from "@init/observability/logger"
import { captureException } from "@init/observability/monitoring"
import { contextStorage } from "hono/context-storage"
import { cors } from "hono/cors"
import { HTTPException } from "hono/http-exception"
import { logger as honoLogger } from "hono/logger"
import { secureHeaders } from "hono/secure-headers"
import authRoutes from "#routes/auth.ts"
import healthRoutes from "#routes/health.ts"
import testRoutes from "#routes/test.ts"
import trpcRoutes from "#routes/trpc.ts"
import { auth } from "#shared/auth.ts"
import { security } from "#shared/security.ts"
import { factory } from "#shared/utils.ts"

const app = factory.createApp()

app.use(cors({ credentials: true, origin: "*" }))
app.use(honoLogger((message, ...rest) => logger.info(rest, message)))
app.use(contextStorage())

// Add context dependencies
app.use(async (c, next) => {
  c.set("auth", auth)
  c.set("db", database())
  c.set("kv", kv())
  c.set("logger", logger)
  c.set("security", security)
  c.set("session", null)

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
  logger.error(err)

  return c.text("Internal Server Error", 500)
})

app.use(secureHeaders())

export const router = app
  .get("/ping", (c) => c.text(Date.now().toString()))
  .route("/auth", authRoutes)
  .route("/health", healthRoutes)
  .route("/test", testRoutes)
  .route("/trpc", trpcRoutes)

export default app
