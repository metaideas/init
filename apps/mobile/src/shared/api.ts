import type { AppClient } from "api/client"

import { createClient } from "@this/utils/hono-client"

import { buildApiUrl } from "~/shared/utils"

export const api = createClient<AppClient>(buildApiUrl("/"))
