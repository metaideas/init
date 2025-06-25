import { singleton } from "@init/utils/singleton"
import { Redis, type RedisConfigNodejs } from "@upstash/redis"

export function redis(config?: Omit<RedisConfigNodejs, "url" | "token">) {
  return singleton("kv", () => Redis.fromEnv(config))
}

export type { Redis } from "@upstash/redis"
