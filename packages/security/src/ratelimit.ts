import type { RatelimitConfig } from "@upstash/ratelimit"
import { Ratelimit } from "@upstash/ratelimit"

import { kv as kvNode } from "@init/kv"
import { kv as kvCloudflare } from "@init/kv/cloudflare"
import { isCloudflare } from "@init/utils/runtime"

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
    redis: isCloudflare ? kvCloudflare : kvNode,
    prefix: `ratelimit:${name}`,
    enableProtection: true,
  })
}

export const { slidingWindow, cachedFixedWindow, fixedWindow, tokenBucket } =
  Ratelimit
