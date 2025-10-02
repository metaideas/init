import { singleton } from "@init/utils/singleton"
import { PostHog, type PostHogOptions, usePostHog } from "posthog-react-native"
import { useEffect } from "react"

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

export function useIdentifyUser({
  user,
}: {
  user: { id: string; email: string }
}) {
  const p = usePostHog()

  useEffect(() => {
    p.identify(user.id, {
      email: user.email,
    })
  }, [p, user.id, user.email])
}

export type Analytics = ReturnType<typeof createAnalytics>

export {
  PostHogProvider as AnalyticsProvider,
  usePostHog as useAnalytics,
} from "posthog-react-native"
