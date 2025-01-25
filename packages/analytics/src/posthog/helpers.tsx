import posthog, { type PostHog } from "posthog-js"
import { PostHogProvider } from "posthog-js/react"
import type { ReactNode } from "react"

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
