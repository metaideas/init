import { Hono } from "hono"
import type { AppContext } from "~/lib/types"

const auth = new Hono<AppContext>().on(["POST", "GET"], "/**", async c => {
  const { auth } = await import("@this/auth/server")

  return auth.handler(c.req.raw)
})

export default auth
