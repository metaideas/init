import posthog, { type PostHog } from "posthog-js"

import env from "@this/env/analytics.web"

export const analytics = posthog.init(env.NEXT_PUBLIC_POSTHOG_API_KEY, {
  api_host: "/ingest",
  ui_host: env.NEXT_PUBLIC_POSTHOG_HOST,
  person_profiles: "identified_only",
  capture_pageview: false, // Disable automatic pageview capture, as we capture manually
  capture_pageleave: true, // Overrides the `capture_pageview` setting
}) as PostHog
