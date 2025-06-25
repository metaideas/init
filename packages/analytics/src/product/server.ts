import { PostHog } from "posthog-node"

import env from "@init/env/analytics/server"
import { singleton } from "@init/utils/singleton"

export const analytics = singleton(
  "analytics-server",
  () =>
    new PostHog(env.POSTHOG_API_KEY, {
      host: env.POSTHOG_HOST,

      // Don't batch events and send them immediately
      flushAt: 1,
      flushInterval: 0,
    })
)
