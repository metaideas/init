import type { RatelimitConfig } from "@upstash/ratelimit"
import { Ratelimit } from "@upstash/ratelimit"

import { kv } from "#index.ts"

export function createRateLimiter(
  name: string,
  options: Omit<
    RatelimitConfig,
    "redis" | "ephemeralCache" | "analytics" | "prefix" | "enableProtection"
  >
) {
  const ephemeralCache = new Map<string, number>()

  return new Ratelimit({
    ...options,
    analytics: true,
    ephemeralCache,
    redis: kv,
    prefix: `ratelimit:${name}`,
    enableProtection: true,
  })
}

export const { slidingWindow, cachedFixedWindow, fixedWindow, tokenBucket } =
  Ratelimit
