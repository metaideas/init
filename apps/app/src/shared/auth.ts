import { createAuthClient } from "@init/auth/client"
import { adminClient, organizationClient } from "@init/auth/client/plugins"
import { buildUrl } from "#shared/utils.ts"

export const authClient = createAuthClient(buildUrl("/api/auth"), [
  adminClient(),
  organizationClient(),
])

export const { useSession, signIn, signOut, signUp } = authClient
