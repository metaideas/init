import { hc } from "hono/client"

import type { AppClient } from "api/client"

// TODO(adelrodriguez): Switch to using an environment variable for the API URL
export const client = hc<AppClient>("http://localhost:8787")
