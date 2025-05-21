import * as SecureStore from "expo-secure-store"

import { createAuthClient } from "@init/auth/client"
import { adminClient, organizationClient } from "@init/auth/client/plugins"
import { expoClient } from "@init/auth/expo/client"
import {
  accessControl,
  adminRole,
  memberRole,
  ownerRole,
} from "@init/auth/permissions"
import { APP_ID } from "@init/utils/constants"

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
