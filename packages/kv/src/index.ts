import env from "@this/env/upstash"
import { Redis } from "@upstash/redis"

export const kv = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
})
