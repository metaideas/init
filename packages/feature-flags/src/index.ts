import { Fault } from "@init/utils/fault"
import { namespacedKey } from "@init/utils/key"

/**
 * The identity of the user for evaluation of the flags. Ideally, this should a
 * user id or another unique identifier.
 */
type Identity = string | number

type FlagOptions = {
  override?: boolean
  identity?: Identity
}

type FlagsConfig = {
  identify: () => Promise<Identity | undefined>
  decide: (key: string, identity: Identity) => Promise<boolean | undefined>
  cache?: {
    get: (key: string) => boolean | undefined | Promise<boolean | undefined>
    set: (key: string, value: boolean) => void | Promise<void>
  }
  onError?: (error: Fault) => void
}

/**
 * A builder function that creates a flag function to evaluate feature flags
 * for a given identity
 *
 * @example
 *
 * const cache = new Map<string, boolean>()
 *
 * const flag = flags({
 *   identify: () => getUserId(),
 *   decide: (key, identity) => analytics.isFeatureEnabled(key, identity),
 *   cache: {
 *     get: (key) => cache.get(key),
 *     set: (key, value) => cache.set(key, value),
 *   },
 * })
 *
 * const betaAccess = flag("flag1", false)
 *
 * await betaAccess() // false
 * await betaAccess({ override: true }) // true
 * await betaAccess({ identity: "test-user" }) // evaluate for specific user
 */
export function flags(options: FlagsConfig) {
  const key = namespacedKey("flag")

  return (keyName: string, defaultValue = false) =>
    async (flagOptions: FlagOptions = {}) => {
      let identity: Identity | undefined

      try {
        // Use override identity if provided, otherwise get from identify function
        if (flagOptions.identity) {
          identity = flagOptions.identity
        } else {
          identity = await options.identify()
        }

        if (identity == null) {
          return defaultValue
        }

        // Return override value if provided
        if (flagOptions.override !== undefined) {
          return flagOptions.override
        }

        const cacheKey = key(keyName, identity)

        // Handle both sync and async cache operations
        const cached = await Promise.resolve(options.cache?.get(cacheKey))

        if (cached != null) {
          return cached
        }

        const isEnabled = await options.decide(keyName, identity)
        const result = isEnabled ?? defaultValue

        // Handle both sync and async cache operations
        if (options.cache) {
          await Promise.resolve(options.cache.set(cacheKey, result))
        }

        return result
      } catch (error) {
        options.onError?.(
          Fault.wrap(error, "FEATURE_FLAG_ERROR", {
            internal: `Error while evaluating feature flag ${keyName}`,
            context: { key: keyName, identity },
          })
        )

        return defaultValue
      }
    }
}
