import { ensureEnv } from "@this/env/helpers"
import { Hono } from "hono"
import type { AppContext } from "~/lib/types"

/**
 * The health check endpoint is used to verify that the API is running with all
 * the necessary environment variables. Since we can only add secrets in the
 * Cloudflare Dashboard, it's a good way to ensure that the API is running
 * correctly.
 */
const health = new Hono<AppContext>().get("/", async c => {
  const [authServer, dbServer] = await Promise.all([
    import("@this/env/auth.server"),
    import("@this/env/db.server"),
  ])

  // Ensure environment variables are set
  ensureEnv([authServer, dbServer], { env: c.env })

  return c.text("ok")
})

export default health
