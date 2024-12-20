import env from "@this/env/kv.server"
import type { Duration } from "@upstash/ratelimit"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const ephemeralCache = new Map<string, number>()

export function createRateLimiter(
  prefix: string,
  limit: number,
  interval: Duration
) {
  return new Ratelimit({
    limiter: Ratelimit.slidingWindow(limit, interval),
    analytics: true,
    ephemeralCache,
    redis: new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    }),
    prefix: `ratelimit:${prefix}`,
    enableProtection: true,
  })
}
