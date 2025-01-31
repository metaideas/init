import { Hono } from "hono"
import type { AppContext } from "~/lib/types"

/**
 * The auth router is used to handle all authentication requests by the auth client.
 */
const auth = new Hono<AppContext>().on(["POST", "GET"], "/**", async c => {
  const { auth } = await import("@this/auth/server")

  return auth.handler(c.req.raw)
})

export default auth
