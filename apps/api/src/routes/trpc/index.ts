import { trpcServer } from "@hono/trpc-server"
import { Hono } from "hono"
import { trpcRouter } from "~/routes/trpc/router"
import { createTRPCContext } from "~/shared/trpc"
import type { AppContext } from "~/shared/types"

const trpc = new Hono<AppContext>().use(
  "/*",
  trpcServer({
    createContext: createTRPCContext,
    router: trpcRouter,
  })
)

export default trpc
