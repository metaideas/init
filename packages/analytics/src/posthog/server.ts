import env from "@this/env/analytics.web"
import { PostHog } from "posthog-node"

export const analytics = new PostHog(env.NEXT_PUBLIC_POSTHOG_KEY, {
  host: env.NEXT_PUBLIC_POSTHOG_HOST,

  // Don't batch events and send them immediately
  flushAt: 1,
  flushInterval: 0,
})
