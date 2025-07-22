import { singleton } from "@init/utils/singleton"
import { PostHog, type PostHogOptions } from "posthog-react-native"

export function createAnalytics(
  apiKey: string,
  host = "https://us.i.posthog.com",
  options: Omit<PostHogOptions, "host" | "apiKey"> = {}
) {
  return singleton(
    "analytics-expo",
    () => new PostHog(apiKey, { host, ...options })
  )
}

export type Analytics = ReturnType<typeof createAnalytics>

export {
  PostHogProvider as AnalyticsProvider,
  usePostHog as useAnalytics,
} from "posthog-react-native"
