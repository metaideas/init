import { trpcServer } from "@hono/trpc-server"
import { type Context, Hono } from "hono"
import type { TRPCContext } from "~/lib/trpc"
import type { AppContext } from "~/lib/types"
import { trpcRouter } from "~/routes/trpc/router"

const trpc = new Hono<AppContext>().use(
  "/*",
  trpcServer({
    router: trpcRouter,
    createContext: (opts, c: Context<AppContext>): TRPCContext => ({
      auth: c.var.auth,
      db: c.var.db,
      queue: c.var.queue,
      logger: c.var.logger,
      req: opts.req,
      resHeaders: opts.resHeaders,
      info: opts.info,
    }),
  })
)

export default trpc
