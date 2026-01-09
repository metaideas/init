import { singleton } from "@init/utils/singleton"
import { init, track, type PlausibleConfig } from "@plausible-analytics/tracker"

export function createWebAnalytics(domain: string, options?: Omit<PlausibleConfig, "domain">) {
  return singleton("analytics-web", () => {
    init({ domain, ...options })
    return {
      track,
    }
  })
}

export type WebAnalytics = ReturnType<typeof createWebAnalytics>
