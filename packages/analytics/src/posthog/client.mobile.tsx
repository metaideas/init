import env from "@this/env/analytics.mobile"
import { createAnalytics, createAnalyticsProvider } from "#posthog/helpers.tsx"

const analytics = createAnalytics(
  env.EXPO_PUBLIC_POSTHOG_KEY,
  env.EXPO_PUBLIC_POSTHOG_HOST
)

const AnalyticsProvider = createAnalyticsProvider(analytics)

export { AnalyticsProvider, analytics }
