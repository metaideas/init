import { Redis } from "@upstash/redis"

import env from "@init/env/kv"
import { remember } from "@init/utils/remember"

export const kv = remember(
  "kv",
  () =>
    new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    })
)
