import { expoClient as baseExpoClient } from "@better-auth/expo/client"
import { AUTH_COOKIE_PREFIX } from "#constants.ts"

export function expoClient(opts: Parameters<typeof baseExpoClient>[0]) {
  return baseExpoClient({
    scheme: AUTH_COOKIE_PREFIX,
    storagePrefix: AUTH_COOKIE_PREFIX,
    ...opts,
  })
}
