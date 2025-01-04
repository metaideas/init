import type { Context, Next } from "hono"
import type { AppContext } from "~/lib/types"

export function loadEnv() {
  return (c: Context<AppContext>, next: Next) => {
    for (const [key, value] of Object.entries(c.env)) {
      process.env[key] = value as string
    }

    return next()
  }
}
