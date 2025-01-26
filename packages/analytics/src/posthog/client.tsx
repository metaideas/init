import posthog, { type PostHog } from "posthog-js"
import { PostHogProvider, usePostHog } from "posthog-js/react"
import { type ReactNode, useEffect } from "react"

export function createAnalytics(key: string, host: string) {
  return posthog.init(key, {
    api_host: "/ingest",
    ui_host: host,
    person_profiles: "identified_only",
    capture_pageview: false, // Disable automatic pageview capture, as we capture manually
    capture_pageleave: true, // Overrides the `capture_pageview` setting
  })
}

export function createAnalyticsProvider(analytics: PostHog | undefined) {
  return function AnalyticsProvider({
    children,
  }: { readonly children: ReactNode }) {
    return <PostHogProvider client={analytics}>{children}</PostHogProvider>
  }
}

export function IdentifyUser({
  user,
}: { user: { id: string; email: string } }) {
  const posthog = usePostHog()

  useEffect(() => {
    if (!posthog) {
      return
    }

    posthog.identify(user.id.toString(), {
      email: user.email,
    })
  }, [posthog, user.id, user.email])

  return null
}

export { usePostHog as useAnalytics } from "posthog-js/react"
