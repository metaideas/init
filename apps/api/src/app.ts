import type { db } from "@this/db/client"
import { client, createFunction, nameFunction } from "@this/queue"
import { serve } from "@this/queue/hono"
import { Hono } from "hono"
import { contextStorage } from "hono/context-storage"
import { withDb } from "./middleware"

const app = new Hono<{
  Bindings: CloudflareBindings
  Variables: { db: typeof db }
}>()

// We use Hono's context storage to allow our packages access to Cloudflare's
// environment variables. Make sure to run this before any middleware that
// needs access to the environment variables.
app.use(contextStorage())

const helloWorld = createFunction(
  nameFunction("Hello World"),
  { event: "test/helloWorld" },
  async ({ step }) => {
    const { logger } = await import("@this/observability/logger")

    logger.info("Hello from Cloudflare Worker!!!")
    step.run("test", () => console.log("Hello from Cloudflare Worker"))
  }
)

app.on(
  ["GET", "PUT", "POST"],
  "/api/inngest",
  serve({
    client,
    functions: [helloWorld],
  })
)

const test = new Hono()
  .get("/ping", c => c.text("pong"))
  .get("/users", withDb, async c => {
    const users = await c.var.db.query.users.findMany({
      columns: {
        email: true,
        createdAt: true,
        publicId: true,
      },
    })

    return c.json(users)
  })

export const router = app.route("/", test)

export default app
