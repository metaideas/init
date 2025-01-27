export type StrictOmit<T, K extends keyof T> = Omit<T, K>

export type Brand<T, B> = T & { readonly __brand__: B }

export type FirstArg<Args extends string[]> = Args extends [
  infer First extends string,
  ...unknown[],
]
  ? First
  : never

export type RestArgs<Args extends string[]> = Args extends [
  unknown,
  ...infer Rest extends string[],
]
  ? Rest
  : never

export type JoinedRest<Rest extends string[]> = Rest extends []
  ? ""
  : `:${Rest[number]}`

/**
 * Converts a union to an intersection.
 */
export type UnionToIntersection<U> = (
  U extends unknown
    ? (k: U) => void
    : never
) extends (k: infer I) => void
  ? I
  : never

/**
 * Merges two types, deeply merging objects.
 */
export type DeepMerge<T, U> = Omit<T, keyof U> & {
  [K in keyof U]: K extends keyof T
    ? T[K] extends Record<string, unknown>
      ? U[K] extends Record<string, unknown>
        ? DeepMerge<T[K], U[K]>
        : U[K]
      : U[K]
    : U[K]
}
