import { type RedisClient, redis } from "bun"
import { type Duration, duration } from "@init/utils/duration"
import { singleton } from "@init/utils/singleton"
import SuperJSON from "superjson"

type ClientConfig = {
  /**
   * Default time to live in seconds
   */
  ttl?: Duration
}

export type KeyPart = string | number

class KeyValueClient {
  defaultTtl?: number
  namespace?: string

  client: RedisClient

  /**
   * Creates a new Redis client
   * @param namespace - The namespace to prefix all keys with
   * @param config - The configuration for the client
   */
  constructor(namespace?: string, config?: ClientConfig) {
    this.namespace = namespace
    this.defaultTtl = config?.ttl ? duration(config.ttl).toSeconds() : undefined
    // Create a singleton instance of the Redis client
    this.client = redis
  }

  normalizeKey(key: string | KeyPart[]): string {
    const parts = typeof key === "string" ? [key] : key
    return this.namespace
      ? [this.namespace, ...parts].map(String).join(":")
      : parts.map(String).join(":")
  }

  async get<TData>(key: string | KeyPart[]): Promise<TData | null> {
    const normalizedKey = this.normalizeKey(key)
    const value = await this.client.get(normalizedKey)
    return value ? SuperJSON.parse<TData>(value) : null
  }

  /**
   * Sets a value in the cache
   * @param key - The key to set
   * @param value - The value to set. Will be serialized using SuperJSON.
   * @param expiresIn - The time to live in seconds
   */
  async set(
    key: string | KeyPart[],
    value: unknown,
    expiresIn?: Duration
  ): Promise<void> {
    const normalizedKey = this.normalizeKey(key)

    await this.client.set(normalizedKey, SuperJSON.stringify(value))

    const ttl = expiresIn ? duration(expiresIn).toSeconds() : this.defaultTtl

    if (ttl !== undefined) {
      await this.client.expire(normalizedKey, ttl)
    }
  }

  async delete(key: string | KeyPart[]): Promise<void> {
    const normalizedKey = this.normalizeKey(key)
    await this.client.del(normalizedKey)
  }

  async health(): Promise<boolean> {
    return await this.client
      .ping()
      .then(() => true)
      .catch(() => false)
  }
}

export function kv(namespace?: string, config?: ClientConfig) {
  return singleton(
    namespace ? `kv:${namespace}` : "kv:default",
    () => new KeyValueClient(namespace, config)
  )
}

export type KeyValue = ReturnType<typeof kv>
