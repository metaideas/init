import "client-only"

import { createAuthClient } from "@init/auth/client"
import { adminClient, organizationClient } from "@init/auth/client/plugins"
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
