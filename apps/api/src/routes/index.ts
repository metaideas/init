import { database } from "@init/database/client"
import { kv } from "@init/kv/client"
import { Scalar } from "@scalar/hono-api-reference"
import { EvlogError, parseError } from "evlog"
import { evlog as requestLogger } from "evlog/hono"
import { openAPIRouteHandler } from "hono-openapi"
import { contextStorage } from "hono/context-storage"
import { cors } from "hono/cors"
import { HTTPException } from "hono/http-exception"
import { secureHeaders } from "hono/secure-headers"
import filesRoutes from "#routes/files.ts"
import healthRoutes from "#routes/health.ts"
import trpcRoutes from "#routes/trpc.ts"
import v1Routes from "#routes/v1/index.ts"
import { auth } from "#shared/auth.ts"
import { files } from "#shared/files.ts"
import { withLanguageDetection } from "#shared/middleware.ts"
import { allowedOrigins, factory, toContentfulStatusCode } from "#shared/utils.ts"

const app = factory.createApp()

app.use(requestLogger())
app.use(withLanguageDetection)
app.use(contextStorage())
app.use(
  secureHeaders({
    crossOriginResourcePolicy: "cross-origin",
  })
)
app.use(
  cors({
    allowHeaders: ["Content-Type", "Authorization", "trpc-accept"],
    allowMethods: ["POST", "GET", "PUT", "OPTIONS"],
    credentials: true,
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    origin: allowedOrigins,
  })
)

app.use(async (c, next) => {
  c.set("auth", auth)
  c.set("db", database)
  c.set("files", files)
  c.set("kv", kv)
  await next()
})

app.onError((error, c) => {
  if (error instanceof HTTPException) {
    return error.getResponse()
  }

  c.var.log.error(error)

  // Only errors raised through `createError` carry a message, `why`, and `fix` written for the
  // caller. Anything else may hold internal detail.
  if (!EvlogError.isEvlogError(error)) {
    return c.json({ message: "Internal Server Error" }, 500)
  }

  const parsed = parseError(error)

  return c.json(
    { fix: parsed.fix, message: parsed.message, why: parsed.why },
    toContentfulStatusCode(parsed.status)
  )
})

app.on(["POST", "GET"], "/auth/**", (c) => c.var.auth.handler(c.req.raw))

export const router = app
  .get(
    "/",
    Scalar({
      pageTitle: "init API",
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
          title: "init API",
          version: "1.0.0",
        },
      },
    })
  )
  .route("/health", healthRoutes)
  .route("/files", filesRoutes)
  .route("/trpc", trpcRoutes)
  .route("/v1", v1Routes)

export default app
