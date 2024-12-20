"use client"

import envMobile from "@this/env/analytics.mobile"
import envWeb from "@this/env/analytics.web"
import posthogBase from "posthog-js"
import { PostHogProvider as BasePostHogProvider } from "posthog-js/react"
import type { ReactNode } from "react"

export const posthog = posthogBase.init(
  envWeb.NEXT_PUBLIC_POSTHOG_KEY || envMobile.EXPO_PUBLIC_POSTHOG_KEY,
  {
    api_host: "/ingest",
    ui_host:
      envWeb.NEXT_PUBLIC_POSTHOG_HOST || envMobile.EXPO_PUBLIC_POSTHOG_HOST,
    person_profiles: "identified_only",
    capture_pageview: false, // Disable automatic pageview capture, as we capture manually
    capture_pageleave: true, // Overrides the `capture_pageview` setting
  }
)

export function PostHogProvider({
  children,
}: { readonly children: ReactNode }) {
  return <BasePostHogProvider client={posthog}>{children}</BasePostHogProvider>
}
