import type { Auth, BetterAuthClientPlugin } from "better-auth"
import { inferAdditionalFields } from "better-auth/client/plugins"
import { createAuthClient as createBetterAuthClient } from "better-auth/react"

export function createAuthClient<Plugin extends BetterAuthClientPlugin>(
  url: string,
  plugins: Plugin[] = []
) {
  return createBetterAuthClient({
    baseURL: url,
    plugins: [inferAdditionalFields<Auth>(), ...plugins],
  })
}

export function createErrorHandler<
  T extends string,
  K extends keyof ReturnType<typeof createAuthClient>["$ERROR_CODES"],
>(_locales: T[], errorCodes: Record<K, Partial<Record<T, string>>>) {
  return (locale: T, code: K) => errorCodes[code]?.[locale] ?? ""
}

export { adminClient, organizationClient } from "better-auth/client/plugins"
