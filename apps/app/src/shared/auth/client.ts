import "client-only"

import { createAuthClient } from "@init/auth/client"
import { adminClient } from "@init/auth/client/plugins"
import { buildApiUrl } from "~/shared/utils"

export const authClient = createAuthClient(buildApiUrl("/auth"), [
  adminClient(),
])

export const { useSession, signIn, signOut, signUp } = authClient
