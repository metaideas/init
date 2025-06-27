import { redis } from "@init/kv/client"
import type { RatelimitConfig } from "@upstash/ratelimit"
import { Ratelimit } from "@upstash/ratelimit"

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
    redis: redis(),
    prefix: `ratelimit:${name}`,
    enableProtection: true,
  })
}

export const { slidingWindow, cachedFixedWindow, fixedWindow, tokenBucket } =
  Ratelimit
