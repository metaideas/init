import type { Auth, BetterAuthClientPlugin } from "better-auth"
import { inferAdditionalFields } from "better-auth/client/plugins"
import { createAuthClient as createBetterAuthClient } from "better-auth/react"

/**
 * Create a BetterAuth client.
 *
 * @param url - The URL of the BetterAuth server.
 * @returns The BetterAuth client.
 */
export function createAuthClient<Plugin extends BetterAuthClientPlugin>(
  url: string,
  plugins: Plugin[] = []
) {
  return createBetterAuthClient({
    baseURL: url,
    plugins: [inferAdditionalFields<Auth>(), ...plugins],
  })
}
