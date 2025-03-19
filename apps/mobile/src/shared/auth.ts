import { createAuthClient } from "@init/auth/client"

import { buildApiUrl } from "~/shared/utils"

export const auth = createAuthClient(buildApiUrl("/auth"))

export const { useSession } = auth
