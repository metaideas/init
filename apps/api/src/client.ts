import { hc } from "hono/client"
import type { router } from "~/app"

const client = hc<typeof router>("")

export function createClient(...args: Parameters<typeof hc>): typeof client {
  return hc<typeof router>(...args)
}
