import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import type { BuildFlagsConfig, Identity } from "./types"

/**
 * Builds a createFlagHook function that mirrors the core buildFlags pattern.
 *
 * @example
 * ```typescript
 * const createFlagHook = buildReactFlags({
 *   identify: async () => ({ distinctId: userId }),
 *   decide: async (key, identity) => api.evaluateFlag(key, identity),
 *   hooks: [new CacheHook(cache)], // optional
 * })
 *
 * export const useBetaAccess = createFlagHook({
 *   key: "beta-access",
 *   defaultValue: false,
 * })
 *
 * export const useTheme = createFlagHook({
 *   key: "theme",
 *   defaultValue: "light",
 *   variants: ["light", "dark", "system"],
 * })
 * ```
 *
 * @remarks
 * Requires @tanstack/react-query QueryClientProvider in your app tree.
 */
export function buildReactFlags<TIdentity extends Identity>(
  config: BuildFlagsConfig<TIdentity>
) {
  function createFlagHook(options: {
    key: string
    defaultValue: boolean
  }): (overrideIdentity?: TIdentity) => boolean

  function createFlagHook<const T extends string[]>(options: {
    key: string
    defaultValue: T[number]
    variants: T
  }): (overrideIdentity?: TIdentity) => T[number]

  function createFlagHook<const T extends string[]>(options: {
    key: string
    defaultValue: boolean | T[number]
    variants?: T
  }): (overrideIdentity?: TIdentity) => boolean | T[number] {
    const { key, defaultValue, variants } = options

    return function useFlagHook(
      overrideIdentity?: TIdentity,
      hookOptions?: { suspense?: boolean }
    ) {
      const useHook = hookOptions?.suspense ? useSuspenseQuery : useQuery
      const { data, isError } = useHook<boolean | T[number]>({
        queryKey: [key, overrideIdentity?.distinctId ?? "default"],
        queryFn: async (): Promise<boolean | T[number]> => {
          const identity = overrideIdentity ?? (await config.identify())

          if (!identity) {
            throw new Error("Identity not found")
          }

          const decision = await config.decide(key, identity)

          const value =
            "variant" in decision ? decision.variant : decision.value

          // Validate variant if provided
          if (
            variants &&
            "variant" in decision &&
            !variants.includes(decision.variant)
          ) {
            throw new Error(`Invalid variant: ${decision.variant}`)
          }

          return value
        },
      })

      if (isError) {
        return defaultValue
      }

      return data ?? defaultValue
    }
  }

  return createFlagHook
}
