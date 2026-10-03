import { createAuthClient } from "@init/auth/client"
import { buildApiUrl } from "#shared/utils.ts"

export const authClient = createAuthClient(buildApiUrl("/auth"))

export const { useSession, signIn, signOut, signUp } = authClient
