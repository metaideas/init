import { httpRouter } from "convex/server"
import { convexAuth } from "#functions/shared/auth/index.ts"
import { authComponent } from "#functions/shared/auth/options.ts"

const http = httpRouter()

authComponent.registerRoutes(http, convexAuth)

export default http
