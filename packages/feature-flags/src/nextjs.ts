import "server-only"

import type { Analytics } from "@init/analytics/product/server"
import type { Auth } from "@init/auth/server"
import { flag } from "flags/next"
import { headers } from "next/headers"

/**
 * Create feature flags for Next.js. These flags are to be used only on the server side.
 */
export function flags(analytics: Analytics, auth: Auth) {
  return (key: string, defaultValue = false) => {
    return flag<boolean>({
      key,
      defaultValue,
      async decide() {
        const session = await auth.api.getSession({ headers: await headers() })

        if (!session) {
          return defaultValue
        }

        const isEnabled = await analytics.isFeatureEnabled(key, session.user.id)

        return isEnabled ?? defaultValue
      },
    })
  }
}
