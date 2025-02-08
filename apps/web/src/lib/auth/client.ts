import "client-only"

import { createAuthClient } from "@this/auth/client"
import { buildApiUrl } from "~/lib/utils"

export const authClient = createAuthClient(buildApiUrl("/auth"))

export const {
  useSession,
  useActiveOrganization,
  useActiveMember,
  useListOrganizations,
  signIn,
  signOut,
  signUp,
} = authClient
