import { type Redis, Redis as RedisNode } from "@upstash/redis"
import { Redis as RedisCloudflare } from "@upstash/redis/cloudflare"

import type { FirstArg, JoinedRest, RestArgs } from "@this/common/types"
import { isCloudflare } from "@this/common/variables"
import env from "@this/env/kv.server"

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

type KVCategory = "stripe"

type KeyFormat<
  T extends KVCategory,
  Args extends string[],
> = `${T}:${FirstArg<Args>}${JoinedRest<RestArgs<Args>>}`

export function generateKey<T extends KVCategory, const Args extends string[]>(
  category: T,
  ...args: Args
): KeyFormat<T, Args> {
  return [category, ...args].join(":") as KeyFormat<T, Args>
}

export const kv = createKv()
