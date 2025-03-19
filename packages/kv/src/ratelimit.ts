import type { RatelimitConfig } from "@upstash/ratelimit"
import { Ratelimit } from "@upstash/ratelimit"

import { isCloudflare } from "@init/utils/runtime"

import { kv as kvCloudflare } from "./cloudflare"
import { kv as kvNode } from "./index"

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
