import { Redis } from "@upstash/redis"

import env from "@init/env/kv"
import { singleton } from "@init/utils/singleton"

export const kv = singleton(
  "kv",
  () =>
    new Redis({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    })
)
