import { serve } from "@this/queue/hono"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { loadEnv } from "~/config/env"
import type { AppContext } from "~/lib/types"
import testRouter from "~/routes/test"

const app = new Hono<AppContext>()

// Load environment variables so they are available to our packages
app.use(loadEnv())

app.use(cors({ origin: ["http://localhost:3000"], credentials: true }))

app.on(["GET", "PUT", "POST"], "/api/inngest", async context => {
  const { client, nameFunction } = await import("@this/queue")

  const helloWorld = client.createFunction(
    nameFunction("Hello World"),
    { event: "test/helloWorld" },
    async ({ step, logger }) => {
      logger.info("Hello from Cloudflare Worker!!!")
      step.run("test", () => console.log("Hello from Cloudflare Worker"))
    }
  )

  const handler = serve({
    client,
    functions: [helloWorld],
  })

  return handler(context)
})

app.on(["POST", "GET"], "/api/auth/**", async c => {
  const { auth } = await import("@this/auth/server")

  return auth.handler(c.req.raw)
})

app.get("/env", c => {
  return c.json(process.env)
})

export const router = app.route("/test", testRouter)

export default app
