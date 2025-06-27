import { singleton } from "@init/utils/singleton"
import posthog, { type PostHogConfig } from "posthog-js"
import { usePostHog } from "posthog-js/react"
import { useEffect } from "react"
import { config } from "./config"

export function createAnalytics(apiKey: string, options?: PostHogConfig) {
  return singleton("analytics-client", () =>
    posthog.init(apiKey, {
      ...config,
      ...(options ?? {}),
      persistence: "localStorage+cookie",
    })
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

export {
  PostHogProvider as AnalyticsProvider,
  usePostHog as useAnalytics,
} from "posthog-js/react"
