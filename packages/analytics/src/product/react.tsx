import posthog from "posthog-js"
import { PostHogProvider } from "posthog-js/react"
import type { ComponentProps } from "react"

import env from "@init/env/analytics/client"
import { singleton } from "@init/utils/singleton"

import { config } from "./config"

export const analytics = singleton("analytics-react", () =>
  posthog.init(env.VITE_POSTHOG_API_KEY, {
    ...config,
    ui_host: env.VITE_POSTHOG_HOST,
    persistence: "localStorage+cookie",
  })
)

export function AnalyticsProvider(
  props: Omit<ComponentProps<typeof PostHogProvider>, "apiKey" | "client">
) {
  return (
    <PostHogProvider
      {...props}
      apiKey={env.VITE_POSTHOG_API_KEY}
      options={{
        ...config,
        ui_host: env.VITE_POSTHOG_HOST,
        ...props.options,
      }}
    />
  )
}
