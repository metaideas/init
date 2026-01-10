import { database } from "@init/db/client"
import { Fault } from "@init/error"
import { kv } from "@init/kv/client"
import { logger } from "@init/observability/logger"
import { honoLogger } from "@init/observability/logger/integrations"
import { captureException } from "@init/observability/monitoring"
import { Scalar } from "@scalar/hono-api-reference"
import { openAPIRouteHandler } from "hono-openapi"
import { contextStorage } from "hono/context-storage"
import { cors } from "hono/cors"
import { HTTPException } from "hono/http-exception"
import { secureHeaders } from "hono/secure-headers"
import healthRoutes from "#routes/health.ts"
import trpcRoutes from "#routes/trpc.ts"
import v1Routes from "#routes/v1/index.ts"
import workflowRoutes from "#routes/workflows.ts"
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
    allowHeaders: ["Content-Type", "Authorization", "trpc-accept"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    credentials: true,
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    origin: env.ALLOWED_API_ORIGINS,
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
      context: error.context,
      debug: error.debug,
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
      pageTitle: "Init API",
      theme: "alternate",
      url: "/openapi",
    })
  )
  .get(
    "/openapi",
    openAPIRouteHandler(app, {
      documentation: {
        info: {
          description: "An example API built with Hono",
          title: "Init API",
          version: "1.0.0",
        },
      },
    })
  )
  .get("/ping", (c) => c.text(Date.now().toString()))
  .route("/health", healthRoutes)
  .route("/workflows", workflowRoutes)
  .route("/trpc", trpcRoutes)
  .route("/v1", v1Routes)

export default app
