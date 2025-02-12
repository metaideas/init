import { createAuthClient } from "@this/auth/client"

import { buildApiUrl } from "~/shared/utils"

export const auth = createAuthClient(buildApiUrl("/auth"))

export const { useSession, useActiveOrganization, useActiveMember } = auth
