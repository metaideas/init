import "client-only"

import { createAuthClient } from "@init/auth/client"
import { adminClient, organizationClient } from "@init/auth/client/plugins"
import {
  accessControl,
  adminRole,
  memberRole,
  ownerRole,
} from "@init/auth/permissions"

import { buildApiUrl } from "~/shared/utils"

export const authClient = createAuthClient(buildApiUrl("/auth"), [
  adminClient(),
  organizationClient({
    ac: accessControl,
    roles: {
      admin: adminRole,
      member: memberRole,
      owner: ownerRole,
    },
  }),
])

export const {
  useActiveOrganization,
  useActiveMember,
  useListOrganizations,

  useSession,
  signIn,
  signOut,
  signUp,
} = authClient
