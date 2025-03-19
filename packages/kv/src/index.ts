import { Redis } from "@upstash/redis"

import env from "@init/env/kv"

export const kv = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
})
