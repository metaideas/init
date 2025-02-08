import { PostHogProvider } from "posthog-react-native"
import type { ComponentProps } from "react"

import env from "@this/env/analytics.mobile"

export function AnalyticsProvider(
  props: Omit<ComponentProps<typeof PostHogProvider>, "apiKey">
) {
  return (
    <PostHogProvider
      {...props}
      apiKey={env.EXPO_PUBLIC_POSTHOG_API_KEY}
      options={{
        ...props.options,
        host: env.EXPO_PUBLIC_POSTHOG_HOST,
      }}
    />
  )
}

export { usePostHog as useAnalytics } from "posthog-react-native"
