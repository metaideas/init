import { PostHogProvider } from "posthog-react-native"
import type { ComponentProps } from "react"

import env from "@init/env/analytics/expo"

import { config } from "./config"

export function AnalyticsProvider(
  props: Omit<ComponentProps<typeof PostHogProvider>, "apiKey">
) {
  return (
    <PostHogProvider
      {...props}
      apiKey={env.EXPO_PUBLIC_POSTHOG_API_KEY}
      options={{
        ...config,
        host: env.EXPO_PUBLIC_POSTHOG_HOST,
        ...props.options,
      }}
    />
  )
}

export { usePostHog as useAnalytics } from "posthog-react-native"
