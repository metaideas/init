import type { Join } from "./type"

export function key<Args extends readonly (string | number)[]>(
  ...args: Args
): Join<Args> {
  return args.map(String).join(":") as Join<Args>
}
export function namespacedKey<Namespace extends string>(
  namespace: Namespace
): <Args extends readonly (string | number)[]>(
  ...args: Args
) => Join<[Namespace, ...Args]>

export function namespacedKey<
  Namespace extends string,
  const Categories extends readonly string[],
>(
  namespace: Namespace,
  categories: Categories
): <
  First extends Categories[number],
  Rest extends readonly (string | number)[],
>(
  first: First,
  ...rest: Rest
) => Join<[Namespace, First, ...Rest]>

export function namespacedKey<
  Namespace extends string,
  const Categories extends readonly string[] = never[],
>(namespace: Namespace, _categories?: Categories) {
  return (...args: (string | number)[]) => key(namespace, ...args)
}
