import { PostHog, PostHogProvider } from "posthog-react-native"
import type { ComponentProps } from "react"

import env from "@init/env/analytics/expo"
import { remember } from "@init/utils/remember"

import { config } from "./config"

export const analytics = remember(
  "analytics-expo",
  () =>
    new PostHog(env.EXPO_PUBLIC_POSTHOG_API_KEY, {
      host: env.EXPO_PUBLIC_POSTHOG_HOST,
    })
)

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
