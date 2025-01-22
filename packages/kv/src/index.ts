import type { FirstArg, JoinedRest, RestArgs } from "@this/common/types"
import env from "@this/env/kv.server"
import { Redis } from "@upstash/redis"

export const kv = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
})

type KVCategory = "stripe"

type KeyFormat<
  T extends KVCategory,
  Args extends string[],
> = `${T}:${FirstArg<Args>}${JoinedRest<RestArgs<Args>>}`

export function generateCacheKey<
  T extends KVCategory,
  const Args extends string[],
>(category: T, ...args: Args): KeyFormat<T, Args> {
  return [category, ...args].join(":") as KeyFormat<T, Args>
}
