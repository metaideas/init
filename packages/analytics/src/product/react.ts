import { singleton } from "@init/utils/singleton"
import posthog, { type PostHogConfig } from "posthog-js"
import { usePostHog } from "posthog-js/react"
import { useEffect } from "react"

export function createAnalytics(apiKey: string, config?: PostHogConfig) {
  return singleton("analytics-client", () =>
    posthog.init(apiKey, {
      capture_pageview: "history_change", // Capture pageview on history change
      persistence: "localStorage+cookie",
      person_profiles: "identified_only",
      ...config,
    })
  )
}

export function useIdentifyUser({ user }: { user: { id: string; email: string } }) {
  const p = usePostHog()

  useEffect(() => {
    p.identify(user.id, {
      email: user.email,
    })
  }, [p, user.id, user.email])
}

export { PostHogProvider as AnalyticsProvider, usePostHog as useAnalytics } from "posthog-js/react"
