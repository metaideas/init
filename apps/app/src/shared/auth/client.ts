import "client-only"

import { createAuthClient } from "@init/auth/client"
import {
  adminClientPlugin,
  organizationClientPlugin,
} from "@init/auth/client/plugins"

import { buildApiUrl } from "~/shared/utils"

export const authClient = createAuthClient(buildApiUrl("/auth"), [
  adminClientPlugin,
  organizationClientPlugin,
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
