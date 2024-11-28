import env from "@this/env/upstash"
import { Index } from "@upstash/vector"

export function createIndex<T extends Record<string, unknown> = never>() {
  return new Index<T>({
    url: env.UPSTASH_VECTOR_REST_URL,
    token: env.UPSTASH_VECTOR_REST_URL,
  })
}
