import posthog from "posthog-js"

import env from "@this/env/analytics/client"

import { config } from "./config"

export const analytics = posthog.init(env.VITE_POSTHOG_API_KEY, {
  ...config,
})
