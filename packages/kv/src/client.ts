import { singleton } from "@init/utils/singleton"
import { type RedisClient, redis } from "bun"
import { seconds, type TimeExpression } from "qte"
import SuperJSON from "superjson"

type ClientConfig = {
  ttl?: TimeExpression
}

export type KeyPart = string | number

function createKeyValueClient(namespace?: string, config?: ClientConfig) {
  const defaultTtl = config?.ttl ? seconds(config.ttl) : undefined
  const client: RedisClient = redis

  const keyValueClient = {
    client,
    defaultTtl,
    delete: remove,
    get,
    health,
    namespace,
    normalizeKey,
    set,
  }

  function normalizeKey(key: string | KeyPart[]): string {
    const parts = typeof key === "string" ? [key] : key
    return keyValueClient.namespace
      ? [keyValueClient.namespace, ...parts].map(String).join(":")
      : parts.map(String).join(":")
  }

  async function get<TData>(key: string | KeyPart[]): Promise<TData | null> {
    const normalizedKey = normalizeKey(key)
    const value = await keyValueClient.client.get(normalizedKey)
    return value ? SuperJSON.parse<TData>(value) : null
  }

  async function set(
    key: string | KeyPart[],
    value: unknown,
    expiresIn?: TimeExpression
  ): Promise<void> {
    const normalizedKey = normalizeKey(key)

    await keyValueClient.client.set(normalizedKey, SuperJSON.stringify(value))

    const ttl = expiresIn ? seconds(expiresIn) : keyValueClient.defaultTtl

    if (ttl !== undefined) {
      await keyValueClient.client.expire(normalizedKey, ttl)
    }
  }

  async function remove(key: string | KeyPart[]): Promise<void> {
    const normalizedKey = normalizeKey(key)
    await keyValueClient.client.del(normalizedKey)
  }

  async function health(): Promise<boolean> {
    return await keyValueClient.client
      .ping()
      .then(() => true)
      .catch(() => false)
  }

  return keyValueClient
}

export function kv(namespace?: string, config?: ClientConfig) {
  return singleton(namespace ? `kv:${namespace}` : "kv:default", () =>
    createKeyValueClient(namespace, config)
  )
}

export type KeyValue = ReturnType<typeof kv>
