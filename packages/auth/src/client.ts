import type { Auth } from "better-auth"
import {
  adminClient,
  inferAdditionalFields,
  organizationClient,
} from "better-auth/client/plugins"
import { createAuthClient as createBetterAuthClient } from "better-auth/react"
import {
  accessControl,
  adminRole,
  memberRole,
  ownerRole,
} from "#permissions.ts"

/**
 * Create a BetterAuth client.
 *
 * @param url - The URL of the BetterAuth server.
 * @returns The BetterAuth client.
 */
export function createAuthClient(url: string) {
  return createBetterAuthClient({
    baseURL: url,
    plugins: [
      inferAdditionalFields<Auth>(),
      adminClient(),
      organizationClient({
        ac: accessControl,
        roles: {
          admin: adminRole,
          member: memberRole,
          owner: ownerRole,
        },
      }),
    ],
  })
}
