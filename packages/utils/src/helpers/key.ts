import type { FirstArg, JoinedRest, RestArgs } from "./type"

type KeyFormat<
  T extends string,
  Args extends string[],
> = `${T}:${FirstArg<Args>}${JoinedRest<RestArgs<Args>>}`

export function buildKeyGenerator<
  const TopKey extends string,
  const SubKeys extends string,
>(): <C extends TopKey, Args extends [SubKeys, ...string[]]>(
  category: C,
  ...args: Args
) => KeyFormat<C, Args> {
  return <C extends TopKey, Args extends [SubKeys, ...string[]]>(
    category: C,
    ...args: Args
  ): KeyFormat<C, Args> => {
    return [category, ...args].join(":") as KeyFormat<C, Args>
  }
}
