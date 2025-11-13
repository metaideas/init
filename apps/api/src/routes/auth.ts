import { factory } from "#shared/utils.ts"

/**
 * The auth router is used to handle all authentication requests by the auth client.
 */
const auth = factory
  .createApp()
  .on(["POST", "GET"], "/**", (c) => c.var.auth.handler(c.req.raw))

export default auth
