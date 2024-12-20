import "client-only"

import {
  adminClient,
  createAuthClient,
  inferAdditionalFields,
  organizationClient,
} from "@this/auth/client"
import {
  accessControl,
  adminRole,
  memberRole,
  ownerRole,
} from "@this/auth/permissions"
import type { Auth } from "@this/auth/server"
import env from "@this/env/auth.web"

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL,
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

export const { useSession, useActiveOrganization, useActiveMember } = authClient
