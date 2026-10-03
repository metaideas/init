import { adminClient, createAuthClient, organizationClient } from "@init/auth/client"
import { buildApiUrl } from "#shared/utils.ts"

export const authClient = createAuthClient(buildApiUrl("/auth"), [
  adminClient(),
  organizationClient(),
])

export const { useSession, signIn, signOut, signUp } = authClient
