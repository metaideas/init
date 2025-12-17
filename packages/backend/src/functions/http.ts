import { httpRouter } from "convex/server"
import { authComponent, convexAuth } from "./shared/auth"

const http = httpRouter()

authComponent.registerRoutes(http, convexAuth)

export default http
