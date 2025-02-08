import type { ExportedHandler } from "@cloudflare/workers-types"

import app from "~/app"

export default {
  fetch: app.fetch,
} satisfies ExportedHandler<CloudflareBindings>
