import { httpRouter } from "convex/server"
import { authComponent, convexAuth } from "#functions/auth.ts"
import env from "#functions/shared/env.ts"

const http = httpRouter()

authComponent.registerRoutes(http, convexAuth, {
  cors: {
    allowedOrigins: env.AUTH_TRUSTED_ORIGINS,
  },
})

export default http
