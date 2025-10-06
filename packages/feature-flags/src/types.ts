/**
 * The identity of the user for evaluation of the flags. Ideally, this should a
 * user id or another unique identifier.
 */
export type Identity = {
  distinctId: string | number
} & Record<string, unknown>

export type HookContext<TIdentity extends Identity = Identity> = {
  flagKey: string
  identity: TIdentity | null
}

export type Decision =
  | {
      value: boolean
    }
  | { variant: string }

export interface Hook<TIdentity extends Identity = Identity> {
  before?: (hookContext: HookContext<TIdentity>) => Promise<void> | void
  resolve?: (
    hookContext: HookContext<TIdentity>
  ) => Promise<Decision | undefined> | Decision | undefined
  after?: (
    hookContext: HookContext<TIdentity>,
    decision: Decision
  ) => Promise<void> | void
  error?: (
    hookContext: HookContext<TIdentity>,
    error: unknown
  ) => Promise<void> | void
  finally?: (hookContext: HookContext<TIdentity>) => Promise<void> | void
}

export type BuildFlagsConfig<TIdentity extends Identity = Identity> = {
  identify: () => Promise<TIdentity | null>
  decide: (key: string, identity: TIdentity) => Promise<Decision>
  hooks?: Hook<TIdentity>[]
}
