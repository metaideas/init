// This is the only place where we need to break the direction of imports, since
// we need to get routers and procedures from the features into the application
// router, so we can have type-safe clients.
import auth from "~/features/auth/procedures"
import { createRouter } from "~/shared/trpc/server"

export const appRouter = createRouter({
  auth,
})

export type AppRouter = typeof appRouter
