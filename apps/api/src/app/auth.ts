import { Hono } from "hono"
import type { AppContext } from "~/shared/types"

/**
 * The auth router is used to handle all authentication requests by the auth client.
 */
const auth = new Hono<AppContext>().on(["POST", "GET"], "/**", (c) =>
  c.var.auth.handler(c.req.raw)
)

export default auth
