import { trpcServer } from "@hono/trpc-server"
import { Hono } from "hono"

import { createTRPCContext } from "~/lib/trpc"
import type { AppContext } from "~/lib/types"
import { trpcRouter } from "~/routes/trpc/router"

const trpc = new Hono<AppContext>().use(
  "/*",
  trpcServer({
    createContext: createTRPCContext,
    router: trpcRouter,
  })
)

export default trpc
