import { key } from "@init/utils/key"
import { stableSerialize } from "@init/utils/serialize"
import type { SetCommandOptions } from "@upstash/redis"
import SuperJSON from "superjson"
import { redis } from "./client"

type CacheOptions = {
  /**
   * Time to live in milliseconds
   */
  ttl?: number
}

/**
 * Creates a function wrapped in a KV cache.
 *
 * @example
 * const cachedFn = cache(myFn, ["my-key"], {
 *   ttl: 60_000 // milliseconds
 * })
 *
 * await cachedFn(1, 2, 3) // Arguments are serialized and used as parts of the cache key
 * await cachedFn(1, 2, 3) // Returns the cached value
 */
export function cache<A extends unknown[], R>(
  fn: (...args: A) => Promise<R>,
  keyParts: string[],
  cacheOptions: CacheOptions = {}
): (...args: A) => Promise<R> {
  // Create storage based on strategy
  const kv = redis()
  const commandOptions: Partial<SetCommandOptions> = {}

  if (cacheOptions.ttl) {
    commandOptions.ex = Math.floor(cacheOptions.ttl / 1000)
  }

  // In-flight deduplication map (always local, per-function instance)
  const inflight = new Map<string, Promise<R>>()

  return async function wrapped(...args: A): Promise<R> {
    const serializedArgs = args.map(stableSerialize)
    const cacheKey = key(...keyParts, ...serializedArgs)

    // Check in-flight requests
    const existing = inflight.get(cacheKey)
    if (existing) {
      return existing
    }

    // Check cache store
    const cached = await kv.get(cacheKey)

    // If we have the value cached, return it
    if (cached !== null && typeof cached === "string") {
      return SuperJSON.parse<R>(cached)
    }

    // Execute and cache
    const promise = (async () => {
      try {
        const val = await fn(...args)
        await kv.set(cacheKey, SuperJSON.stringify(val), commandOptions)
        return val
      } finally {
        inflight.delete(cacheKey)
      }
    })()

    inflight.set(cacheKey, promise)
    return promise
  }
}
