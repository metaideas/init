import "client-only"

import { createAuthClient } from "@this/auth/client"
import { buildUrl } from "~/lib/utils"

export const authClient = createAuthClient(buildUrl("/api/auth"))

export const { useSession, useActiveOrganization, useActiveMember } = authClient
