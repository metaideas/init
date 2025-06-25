import { useFeatureFlag as usePostHogFeatureFlag } from "posthog-react-native"
import type { ReactNode } from "react"

export function FeatureFlag({
  flag,
  match,
  children,
  fallback,
}: {
  flag: string
  match: string | boolean
  children: ReactNode
  fallback: ReactNode
}) {
  const value = usePostHogFeatureFlag(flag)

  if (value !== undefined && value === match) {
    return children
  }

  return fallback
}

export function useFeatureFlag(flag: string) {
  return usePostHogFeatureFlag(flag)
}
