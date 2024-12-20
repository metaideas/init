import env from "@this/env/ai.server"
import { SemanticCache } from "@upstash/semantic-cache"
import { Index } from "@upstash/vector"

export function createIndex<T extends Record<string, unknown> = never>() {
  return new Index<T>({
    url: env.UPSTASH_VECTOR_REST_URL,
    token: env.UPSTASH_VECTOR_REST_URL,
  })
}

export function createSemanticCache({
  namespace,
  minProximity = 0.5,
}: { namespace?: string; minProximity?: number } = {}) {
  const index = createIndex()

  return new SemanticCache({
    index,
    minProximity,
    namespace,
  })
}
