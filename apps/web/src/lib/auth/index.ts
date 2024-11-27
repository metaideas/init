import type { Auth } from "@this/auth"
import {
  adminClient,
  createAuthClient,
  inferAdditionalFields,
} from "@this/auth/client"
import env from "@this/env/auth/web"

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [inferAdditionalFields<Auth>(), adminClient()],
})

export const { useSession } = authClient
