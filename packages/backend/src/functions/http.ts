import { httpRouter } from "convex/server"
import { env } from "#functions/_generated/server.js"
import { authComponent, convexAuth } from "#functions/auth.ts"

const http = httpRouter()

authComponent.registerRoutes(http, convexAuth, {
  cors: {
    allowedOrigins: env.AUTH_TRUSTED_ORIGINS.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  },
})

export default http
