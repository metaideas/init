import * as SecureStore from "expo-secure-store"

import { createAuthClient } from "@init/auth/client"
import { expoClient } from "@init/auth/expo/client"
import { APP_ID } from "@init/utils/constants"

import { buildApiUrl } from "~/shared/utils"

export const auth = createAuthClient(buildApiUrl("/auth"), [
  expoClient({
    scheme: APP_ID,
    storagePrefix: APP_ID,
    storage: SecureStore,
  }),
])

export const { useSession } = auth
