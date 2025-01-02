import type { router } from "~/app"

/**
 * This is the type of the client that is exported from the API to use with
 * `hono/client` to have a type-safe client.
 */
export type AppClient = typeof router
