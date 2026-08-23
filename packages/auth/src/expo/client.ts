import { expoClient as baseExpoClient } from "@better-auth/expo/client"
import { AUTH_API_COOKIE_PREFIX, AUTH_COOKIE_PREFIX } from "#constants.ts"

export function expoClient(opts: Parameters<typeof baseExpoClient>[0]) {
  return baseExpoClient({
    // Must match the API's cookie prefix: the Expo plugin only persists
    // cookies whose names start with this value, and it defaults to
    // "better-auth" when unset.
    cookiePrefix: AUTH_API_COOKIE_PREFIX,
    scheme: AUTH_COOKIE_PREFIX,
    storagePrefix: AUTH_COOKIE_PREFIX,
    ...opts,
  })
}
