import { singleton } from "@init/utils/singleton"
import { PostHog, type PostHogOptions } from "posthog-node"

export function createAnalytics(
  apiKey: string,
  host = "https://us.i.posthog.com",
  options: Omit<PostHogOptions, "host" | "apiKey"> = {}
) {
  return singleton(
    "analytics-server",
    () =>
      new PostHog(apiKey, {
        host,
        // Don't batch events and send them immediately
        flushAt: 1,
        flushInterval: 0,

        ...options,
      })
  )
}
