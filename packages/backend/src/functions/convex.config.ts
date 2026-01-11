import { defineApp } from "convex/server"
import betterAuth from "#functions/components/better-auth/convex.config.ts"

const app = defineApp()

app.use(betterAuth)

export default app
