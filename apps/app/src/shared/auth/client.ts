import "client-only"

import { createAuthClient } from "@this/auth/client"
import { adminClient, organizationClient } from "@this/auth/client/plugins"
import { buildApiUrl } from "~/shared/utils"

export const authClient = createAuthClient(buildApiUrl("/auth"), [
  adminClient(),
  organizationClient(),
])

export const {
  useSession,
  useActiveOrganization,
  useActiveMember,
  useListOrganizations,
  signIn,
  signOut,
  signUp,
} = authClient
