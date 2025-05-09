import type { FirstArg, JoinedRest, RestArgs } from "./type"

type KeyFormat<
  T extends string,
  Args extends string[],
> = `${T}:${FirstArg<Args>}${JoinedRest<RestArgs<Args>>}`

export function buildKeyGenerator<const T extends string>(): <
  C extends T,
  Args extends string[],
>(
  category: C,
  ...args: Args
) => KeyFormat<C, Args> {
  return <C extends T, Args extends string[]>(
    category: C,
    ...args: Args
  ): KeyFormat<C, Args> => {
    return [category, ...args].join(":") as KeyFormat<C, Args>
  }
}
