import type { AppClient } from "api/client"
import { hc } from "hono/client"

import { buildApiUrl } from "~/lib/utils"

export const api = hc<AppClient>(buildApiUrl("/"))
