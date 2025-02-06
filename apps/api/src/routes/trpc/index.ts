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
      info: opts.info,
      kv: c.var.kv,
      logger: c.var.logger,
      queue: c.var.queue,
      req: opts.req,
      resHeaders: opts.resHeaders,
    }),
  })
)

export default trpc
