import { createAuthClient } from "@init/auth/client"
import { adminClient, organizationClient } from "@init/auth/client/plugins"
import { expoClient } from "@init/auth/expo"
import {
  accessControl,
  adminRole,
  memberRole,
  ownerRole,
} from "@init/auth/permissions"
import { APP_ID } from "@init/utils/constants"
import * as SecureStore from "expo-secure-store"
import { buildApiUrl } from "~/shared/utils"

export const auth = createAuthClient(buildApiUrl("/auth"), [
  expoClient({
    scheme: APP_ID,
    storagePrefix: APP_ID,
    storage: SecureStore,
  }),
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

export const { useSession } = auth

/**
 * Use this to provide headers to clients that need to make authenticated requests.
 */
export function getAuthHeaders() {
  const headers = new Headers()
  const cookies = auth.getCookie()
  if (cookies) {
    headers.set("Cookie", cookies)
  }
  return headers
}
