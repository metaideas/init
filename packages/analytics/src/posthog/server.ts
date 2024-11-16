import env from "@this/env/posthog/nextjs"
import { PostHog } from "posthog-node"

export const posthog = new PostHog(env.PUBLIC_POSTHOG_KEY, {
  host: env.PUBLIC_POSTHOG_HOST,

  // Don't batch events and send them immediately
  flushAt: 1,
  flushInterval: 0,
})
