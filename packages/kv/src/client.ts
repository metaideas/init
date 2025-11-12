import { RedisClient } from "bun"
import { kv as env } from "@init/env/presets"
import { singleton } from "@init/utils/singleton"
import SuperJSON from "superjson"

type ClientConfig = {
  /**
   * Default time to live in seconds
   */
  ttl?: number
}

export type KeyPart = string | number

class KvClient {
  private defaultTtl?: number
  private namespace?: string

  client: RedisClient

  /**
   * Creates a new Redis client
   * @param namespace - The namespace to prefix all keys with
   * @param config - The configuration for the client
   */
  constructor(url: string, namespace?: string, config?: ClientConfig) {
    this.namespace = namespace
    this.defaultTtl = config?.ttl
    // Create a singleton instance of the Redis client
    this.client = singleton("redis", () => new RedisClient(url))
  }

  private key(parts: KeyPart[]): string {
    return this.namespace
      ? [this.namespace, ...parts].map(String).join(":")
      : parts.map(String).join(":")
  }

  async get<TData>(key: string): Promise<TData | null>
  async get<TData>(key: KeyPart[]): Promise<TData | null>
  async get<TData>(key: string | KeyPart[]): Promise<TData | null> {
    const keyString = typeof key === "string" ? key : this.key(key)
    const value = await this.client.get(keyString)
    return value ? SuperJSON.parse<TData>(value) : null
  }

  /**
   * Sets a value in the cache
   * @param key - The key to set
   * @param value - The value to set. Will be serialized using SuperJSON.
   * @param expiresIn - The time to live in seconds
   */
  async set(key: string, value: unknown, expiresIn?: number): Promise<void>
  async set(key: KeyPart[], value: unknown, expiresIn?: number): Promise<void>
  async set(
    key: string | KeyPart[],
    value: unknown,
    expiresIn?: number
  ): Promise<void> {
    const keyString = typeof key === "string" ? key : this.key(key)

    await this.client.set(keyString, SuperJSON.stringify(value))

    const ttl = expiresIn ?? this.defaultTtl

    if (ttl !== undefined) {
      await this.client.expire(keyString, ttl)
    }
  }

  async delete(key: string): Promise<void>
  async delete(key: KeyPart[]): Promise<void>
  async delete(key: string | KeyPart[]): Promise<void> {
    const keyString = typeof key === "string" ? key : this.key(key)
    await this.client.del(keyString)
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
    () => new KvClient(env().KV_URL, namespace, config)
  )
}

export type KeyValue = ReturnType<typeof kv>
