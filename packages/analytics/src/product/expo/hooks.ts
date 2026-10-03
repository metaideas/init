import { usePostHog } from "posthog-react-native"
import {
  useIdentifyUser as useIdentifyAnalyticsUser,
  type AnalyticsUser,
} from "#shared/use-identify-user.ts"

export function useIdentifyUser({ user }: { user: AnalyticsUser }) {
  useIdentifyAnalyticsUser(usePostHog(), user)
}

export {
  PostHogProvider as AnalyticsProvider,
  usePostHog as useAnalytics,
} from "posthog-react-native"
