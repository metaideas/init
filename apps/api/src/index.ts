import type { ExportedHandler } from "@cloudflare/workers-types"

import app from "~/routes"

export default {
  fetch: app.fetch,
} satisfies ExportedHandler<CloudflareBindings>
