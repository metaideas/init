import env from "@this/env/analytics.web"
import { createAnalytics, createAnalyticsProvider } from "#posthog/helpers.tsx"

const analytics = createAnalytics(
  env.NEXT_PUBLIC_POSTHOG_KEY,
  env.NEXT_PUBLIC_POSTHOG_HOST
)

const AnalyticsProvider = createAnalyticsProvider(analytics)

export { AnalyticsProvider, analytics }
