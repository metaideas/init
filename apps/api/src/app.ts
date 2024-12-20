import type { db } from "@this/db/client"
import { serve } from "@this/queue/hono"
import { Hono } from "hono"
import { contextStorage } from "hono/context-storage"
import { cors } from "hono/cors"
import { withDb } from "~/middleware"

const app = new Hono<{
  Bindings: CloudflareBindings
  Variables: { db: typeof db }
}>()

// We use Hono's context storage to allow our packages access to Cloudflare's
// environment variables. Make sure to run this before any middleware that
// needs access to the environment variables.
app.use(contextStorage())

app.use(cors({ origin: ["http://localhost:3000"], credentials: true }))

app.on(["GET", "PUT", "POST"], "/api/inngest", async c => {
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

  return handler(c)
})

app.on(["POST", "GET"], "/api/auth/**", async c => {
  const { auth } = await import("@this/auth/server")
  return auth.handler(c.req.raw)
})

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
  .post("/email-test", async c => {
    const { sendEmail } = await import("@this/email")
    const { default: TestEmail } = await import("@this/email/test-email")

    await sendEmail({
      emails: ["delivered@resend.dev"],
      subject: "Test",
      body: TestEmail(),
    })

    return c.json({ message: "Email sent" })
  })

export const router = app.route("/", test)

export default app
