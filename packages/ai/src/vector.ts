import { SemanticCache } from "@upstash/semantic-cache"
import { Index, type IndexConfig } from "@upstash/vector"

export function createIndex<T extends Record<string, unknown> = never>(
  options: Omit<IndexConfig, "url" | "token"> = {},
  env?: { url: string; token: string }
) {
  return Index.fromEnv(
    env
      ? {
          UPSTASH_VECTOR_REST_TOKEN: env.token,
          UPSTASH_VECTOR_REST_URL: env.url,
        }
      : undefined,
    options
  ) as Index<T>
}

export function createSemanticCache(
  index: Index,
  options: { namespace?: string; minProximity: number } = { minProximity: 0.5 }
) {
  return new SemanticCache({
    index,
    minProximity: options.minProximity,
    namespace: options.namespace,
  })
}
