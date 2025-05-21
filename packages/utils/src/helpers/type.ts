export type StrictOmit<T, K extends keyof T> = Omit<T, K>

/**
 * Returns the first argument of an array.
 */
export type FirstArg<Args extends string[]> = Args extends [
  infer First extends string,
  ...unknown[],
]
  ? First
  : never

/**
 * Returns the rest of an array.
 */
export type RestArgs<Args extends string[]> = Args extends [
  unknown,
  ...infer Rest extends string[],
]
  ? Rest
  : never

/**
 * Joins the rest of an array into a string.
 */
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

/**
 * Makes a type more readable in IDE tooltips by expanding intersections and
 * removing unnecessary type information.
 */
export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

type StringToArray<
  S extends string,
  Acc extends string[] = [],
> = S extends `${infer Char}${infer Rest}`
  ? StringToArray<Rest, [...Acc, Char]>
  : Acc

/**
 * A type that validates if a string has the length specified by a number. If
 * valid, it resolves to the string. If invalid, it resolves to an error message
 * string, causing a type error on assignment.
 */
export type ConstrainedString<
  ActualString extends string,
  ExpectedLengthSpec extends number,
  // --- Internal Helper Types ---
  _TargetNumericLength extends number = ExpectedLengthSpec extends number
    ? ExpectedLengthSpec // If ExpectedLengthSpec is already a number
    : ExpectedLengthSpec extends string
      ? ExpectedLengthSpec // If it's a string like "3", convert to 3
      : never, // Invalid ExpectedLengthSpec format
  _ActualCharsTuple extends string[] = StringToArray<ActualString>,
  _ActualNumericLength extends number = _ActualCharsTuple["length"],
> = _TargetNumericLength extends never
  ? `Error: Invalid length specification "${ExpectedLengthSpec}". Must be a number or a string representation of a number.`
  : _ActualNumericLength extends _TargetNumericLength
    ? ActualString // Validation passed: the type is the string literal itself
    : `Error: String "${ActualString}" (length: ${_ActualNumericLength}) must be exactly ${_TargetNumericLength} characters.`
