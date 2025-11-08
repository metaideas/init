import { stableSerialize } from "@init/utils/serialize"
import { type KeyPart, kv } from "./client"

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
  parts: KeyPart[],
  ttl = 60
): (...args: A) => Promise<R> {
  // Create storage based on strategy
  const client = kv("function-cache", { ttl })

  // In-flight deduplication map (always local, per-function instance)
  const inflight = new Map<string, Promise<R>>()

  return async function wrapped(...args: A): Promise<R> {
    const serializedArgs = args.map(stableSerialize)
    const keyParts = [...parts, ...serializedArgs]
    const cacheKey = keyParts.map(String).join(":")

    // Check in-flight requests
    const existing = inflight.get(cacheKey)
    if (existing) {
      return existing
    }

    // Check cache store
    const cached = await client.get<R>(keyParts)

    // If we have the value cached, return it
    if (cached !== null) {
      return cached
    }

    // Execute and cache
    const promise = (async () => {
      try {
        const value = await fn(...args)
        await client.set(keyParts, value)
        return value
      } finally {
        inflight.delete(cacheKey)
      }
    })()

    inflight.set(cacheKey, promise)
    return promise
  }
}
