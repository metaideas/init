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
