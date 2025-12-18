import { database } from "@init/db/client"
import { Fault } from "@init/error"
import { kv } from "@init/kv/client"
import { logger } from "@init/observability/logger"
import { honoLogger } from "@init/observability/logger/integrations"
import { captureException } from "@init/observability/monitoring"
import { Scalar } from "@scalar/hono-api-reference"
import { contextStorage } from "hono/context-storage"
import { cors } from "hono/cors"
import { HTTPException } from "hono/http-exception"
import { secureHeaders } from "hono/secure-headers"
import { openAPIRouteHandler } from "hono-openapi"
import healthRoutes from "#routes/health.ts"
import trpcRoutes from "#routes/trpc.ts"
import v1Routes from "#routes/v1/index.ts"
import { auth } from "#shared/auth.ts"
import env from "#shared/env.ts"
import { security } from "#shared/security.ts"
import { factory } from "#shared/utils.ts"

const app = factory.createApp()

app.use(honoLogger())
app.use(contextStorage())
app.use(
  secureHeaders({
    crossOriginResourcePolicy: "cross-origin",
  })
)
app.use(
  cors({
    credentials: true,
    origin: env.ALLOWED_API_ORIGINS,
    allowHeaders: ["Content-Type", "Authorization", "trpc-accept"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  })
)

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

app.onError((error, c) => {
  if (Fault.isFault(error)) {
    c.var.logger.error(error.flatten(), {
      cause: error.cause,
      debug: error.debug,
      context: error.context,
      tag: error.tag,
    })
  }

  if (error instanceof HTTPException) {
    return error.getResponse()
  }

  captureException(error)

  return c.text("Internal Server Error", 500)
})

// Authentication routes
app.on(["POST", "GET"], "/auth/**", (c) => c.var.auth.handler(c.req.raw))

export const router = app
  .get(
    "/",
    Scalar({
      url: "/openapi",
      theme: "alternate",
      pageTitle: "Init API",
    })
  )
  .get(
    "/openapi",
    openAPIRouteHandler(app, {
      documentation: {
        info: {
          title: "Init API",
          version: "1.0.0",
          description: "An example API built with Hono",
        },
      },
    })
  )
  .get("/ping", (c) => c.text(Date.now().toString()))
  .route("/health", healthRoutes)
  .route("/trpc", trpcRoutes)
  .route("/v1", v1Routes)

export default app
