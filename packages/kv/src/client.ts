import { singleton } from "@init/utils/singleton"
import { createStorage, type Storage } from "unstorage"
import redisDriver from "unstorage/drivers/redis"
import { ENV } from "#env.generated.ts"

export type KeyPart = string | number

export function kv(): Storage {
  return singleton("kv", () => createStorage({ driver: redisDriver({ url: ENV.REDIS_URL }) }))
}

export function normalizeKey(...parts: KeyPart[]): string {
  return parts.map(String).join(":")
}

export function namespaceKey(namespace: string) {
  return (...parts: KeyPart[]) => normalizeKey(namespace, ...parts)
}

export type KeyValue = Storage
