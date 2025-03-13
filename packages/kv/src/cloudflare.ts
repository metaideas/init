import { Redis } from "@upstash/redis/cloudflare"

import env from "@this/env/kv"

export const kv = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
})
