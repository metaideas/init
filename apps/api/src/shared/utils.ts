import { getContext } from "hono/context-storage"
import { createFactory } from "hono/factory"
import type { AppContext } from "#shared/types.ts"
import { ENV } from "#shared/env.generated.ts"

export const baseUrl = ENV.PORTLESS_URL ?? ENV.BASE_URL

export const allowedOrigins = ENV.PORTLESS_URL
  ? ENV.ALLOWED_API_ORIGINS.map(
      (origin) =>
        new URL(
          ENV.PORTLESS_URL?.replace(new URL(ENV.BASE_URL).hostname, new URL(origin).hostname) ??
            origin
        ).origin
    )
  : ENV.ALLOWED_API_ORIGINS

/**
 * A utility function to create Hono apps and middlewares with the correct context type.
 */
export const factory = createFactory<AppContext>()

export function context<T extends AppContext = AppContext>() {
  return getContext<T>()
}
