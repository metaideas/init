import { getContext } from "hono/context-storage"
import { createFactory } from "hono/factory"
import type { AppContext } from "#shared/types.ts"
import env from "#shared/env.ts"

export const baseUrl = env.PORTLESS_URL ?? env.BASE_URL

export const allowedOrigins = env.PORTLESS_URL
  ? env.ALLOWED_API_ORIGINS.map(
      (origin) =>
        new URL(
          env.PORTLESS_URL?.replace(new URL(env.BASE_URL).hostname, new URL(origin).hostname) ??
            origin
        ).origin
    )
  : env.ALLOWED_API_ORIGINS

/**
 * A utility function to create Hono apps and middlewares with the correct context type.
 */
export const factory = createFactory<AppContext>()

export function context<T extends AppContext = AppContext>() {
  return getContext<T>()
}
