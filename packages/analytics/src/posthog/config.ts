import type { PostHogConfig } from "posthog-js"

export const config = {
  person_profiles: "identified_only",
  capture_pageview: false, // Disable automatic pageview capture, as we capture manually
  capture_pageleave: true, // Overrides the `capture_pageview` setting
} satisfies Partial<PostHogConfig>
