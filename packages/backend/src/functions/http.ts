import { httpRouter } from "convex/server"
import { convexAuth } from "./shared/auth"
import { authComponent } from "./shared/auth/options"

const http = httpRouter()

authComponent.registerRoutes(http, convexAuth)

export default http
