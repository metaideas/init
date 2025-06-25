import type { router } from "~/app"
import type { trpcRouter } from "~/app/trpc/router"

/**
 * This is the type of the client that is exported from the API to use with
 * `hono/client` to have a type-safe RPC client. This is for the REST API routes.
 * For the TRPC routes, see `TRPCClient`.
 */
export type AppClient = typeof router

/**
 * This is the type of the TRPC client to be used on clients.
 */
export type TRPCClient = typeof trpcRouter
