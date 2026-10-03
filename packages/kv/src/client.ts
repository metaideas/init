import { createStorage } from "unstorage"
import redisDriver from "unstorage/drivers/redis"
import { ENV } from "#env.generated.ts"

export const kv = createStorage({ driver: redisDriver({ url: ENV.REDIS_URL }) })

export type KeyPart = string | number

export function normalizeKey(...parts: KeyPart[]): string {
  return parts.map(String).join(":")
}

export function namespaceKey(namespace: string) {
  return (...parts: KeyPart[]) => normalizeKey(namespace, ...parts)
}

export type KeyValue = typeof kv
