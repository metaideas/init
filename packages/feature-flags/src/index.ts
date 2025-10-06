import type {
  BuildFlagsConfig,
  Decision,
  Hook,
  HookContext,
  Identity,
} from "./types"

/**
 * A builder function that creates a flag function to evaluate feature flags
 * for a given identity
 *
 * @example
 *
 *
 * const createFlag = buildFlags({
 *   identify: () => getUserId(),
 *   decide: (key, identity) => analytics.isFeatureEnabled(key, identity),
 *   hooks: [
 *     // add hooks here
 *   ],
 * })
 * const betaAccess = createFlag("flag1", false)
 *
 * await betaAccess() // false
 * await betaAccess({ override: true }) // true
 * await betaAccess({ identity: "test-user" }) // evaluate for specific user
 *
 * // Or
 *
 * const themeName = createFlag("theme", "light", ["light", "dark", "system"])
 *
 * const result = await themeName() // "result" is type-safe and can be "light", "dark", or "system"
 */
export function buildFlags<TIdentity extends Identity>(
  config: BuildFlagsConfig<TIdentity>
) {
  function createFlag(options: {
    key: string
    defaultValue: boolean
  }): (overrideIdentity?: TIdentity) => Promise<boolean>
  function createFlag<const T extends string[]>(options: {
    key: string
    defaultValue: T[number]
    variants: T
  }): (overrideIdentity?: TIdentity) => Promise<T[number]>
  function createFlag<const T extends string[]>(options: {
    key: string
    defaultValue: boolean | T[number]
    variants?: T
  }): (overrideIdentity?: TIdentity) => Promise<boolean | T[number]> {
    const hooks = config?.hooks ?? []

    return async (overrideIdentity) => {
      let identity: TIdentity | null = null
      let result: boolean | T[number] | undefined

      try {
        identity = await identify(config.identify, overrideIdentity)

        const hookContext = { flagKey: options.key, identity }

        await runBeforeHooks(hooks, hookContext)

        const resolveResult = await runResolveHooks(hooks, hookContext)

        if (resolveResult) {
          return extractDecisionValue(resolveResult)
        }

        const decision = await evaluateDecision(
          config.decide,
          options.key,
          identity,
          options.variants
        )

        await runAfterHooks(hooks, hookContext, decision)

        result = extractDecisionValue(decision)
      } catch (error) {
        await runErrorHooks(hooks, { flagKey: options.key, identity }, error)
      } finally {
        await runFinallyHooks(hooks, { flagKey: options.key, identity })
      }

      return result ?? options.defaultValue
    }
  }

  return createFlag
}

async function identify<TIdentity extends Identity>(
  fn: () => TIdentity | null | Promise<TIdentity | null>,
  overrideIdentity: TIdentity | undefined
): Promise<TIdentity> {
  if (overrideIdentity) {
    return overrideIdentity
  }

  const resolvedIdentity = await fn()

  if (!resolvedIdentity) {
    throw new Error("Identity not found")
  }

  return resolvedIdentity
}

function extractDecisionValue(decision: Decision) {
  return "variant" in decision ? decision.variant : decision.value
}

async function evaluateDecision<TIdentity extends Identity>(
  decide: (key: string, identity: TIdentity) => Decision | Promise<Decision>,
  flagKey: string,
  flagIdentity: TIdentity,
  variants?: readonly string[]
): Promise<Decision> {
  const decision = await decide(flagKey, flagIdentity)

  if ("variant" in decision) {
    validateVariant(decision.variant, variants)
  }

  return decision
}

async function runBeforeHooks<TIdentity extends Identity>(
  hooks: Hook<TIdentity>[],
  hookContext: HookContext<TIdentity>
) {
  const tasks = hooks.map((hook) => hook.before?.(hookContext))

  await Promise.allSettled(tasks)
}

async function runResolveHooks<TIdentity extends Identity>(
  hooks: Hook<TIdentity>[],
  hookContext: HookContext<TIdentity>
) {
  for (const hook of hooks) {
    try {
      // biome-ignore lint/performance/noAwaitInLoops: we need to await the hook
      const value = await hook.resolve?.(hookContext)

      if (value !== undefined) {
        return value
      }
    } catch {
      // Continue to next hook if this one fails
    }
  }

  return
}

async function runAfterHooks<TIdentity extends Identity>(
  hooks: Hook<TIdentity>[],
  hookContext: HookContext<TIdentity>,
  decision: Decision
) {
  const tasks = hooks.map((hook) => hook.after?.(hookContext, decision))
  await Promise.allSettled(tasks)
}

async function runErrorHooks<TIdentity extends Identity>(
  hooks: Hook<TIdentity>[],
  hookContext: HookContext<TIdentity>,
  error: unknown
) {
  const tasks = hooks.map((hook) => hook.error?.(hookContext, error))
  await Promise.allSettled(tasks)
}

async function runFinallyHooks<TIdentity extends Identity>(
  hooks: Hook<TIdentity>[],
  hookContext: HookContext<TIdentity>
) {
  const tasks = hooks.map((hook) => hook.finally?.(hookContext))
  await Promise.allSettled(tasks)
}

function validateVariant(value: string, variants?: readonly string[]) {
  if (!variants) {
    return
  }

  if (!variants.includes(value)) {
    throw new Error(`Invalid variant: ${value}`)
  }
}
