import { trpcServer } from "@hono/trpc-server"
import { trpcRouter } from "~/routes/trpc/router"
import { createTRPCContext } from "~/shared/trpc"
import { factory } from "~/shared/utils"

const trpc = factory.createApp().use(
  "/*",
  trpcServer({
    createContext: createTRPCContext,
    router: trpcRouter,
  })
)

export default trpc
