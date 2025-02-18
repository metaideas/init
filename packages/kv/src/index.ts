import { type Redis, Redis as RedisNode } from "@upstash/redis"
import { Redis as RedisCloudflare } from "@upstash/redis/cloudflare"

import env from "@this/env/kv"
import { buildKeyGenerator } from "@this/utils/key"
import { isCloudflare } from "@this/utils/runtime"

function createKv(): Redis {
  if (isCloudflare) {
    return new RedisCloudflare({
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    })
  }

  return new RedisNode({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  })
}

type KVCategory = "stripe" | "auth" | "organization"

export const generateKVKey = buildKeyGenerator<KVCategory>()

export const kv = createKv()
