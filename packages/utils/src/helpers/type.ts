type StringToArray<
  S extends string,
  Acc extends string[] = [],
> = S extends `${infer Char}${infer Rest}`
  ? StringToArray<Rest, [...Acc, Char]>
  : Acc

/**
 * Helper type to check if A <= B using tuple length comparison.
 */
type LessThanOrEqual<
  A extends number,
  B extends number,
  CounterA extends readonly unknown[] = [],
  CounterB extends readonly unknown[] = [],
> = CounterA["length"] extends A
  ? CounterB["length"] extends B
    ? true // A === B
    : CounterB extends readonly [...CounterA, ...infer Rest]
      ? Rest["length"] extends 0
        ? true // A === B
        : true // A < B (there are remaining items in CounterB)
      : false // A > B
  : CounterB["length"] extends B
    ? false // A > B (CounterA still growing but CounterB reached B)
    : LessThanOrEqual<
        A,
        B,
        readonly [...CounterA, unknown],
        readonly [...CounterB, unknown]
      >

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

/**
 * A type that validates if a string has the length specified by a number. If
 * valid, it resolves to the string. If invalid, it resolves to an error message
 * string, causing a type error on assignment.
 */
export type ConstrainedString<
  ActualString extends string,
  MaxLengthSpec extends number,
  // --- Internal Helper Types ---
  _MaxNumericLength extends number = MaxLengthSpec extends number
    ? MaxLengthSpec // If MaxLengthSpec is already a number
    : MaxLengthSpec extends string
      ? MaxLengthSpec // If it's a string like "3", convert to 3
      : never, // Invalid MaxLengthSpec format
  _ActualCharsTuple extends string[] = StringToArray<ActualString>,
  _ActualNumericLength extends number = _ActualCharsTuple["length"],
  // Helper type to check if A <= B
  _IsLengthValid extends boolean = _ActualNumericLength extends number
    ? _MaxNumericLength extends number
      ? LessThanOrEqual<_ActualNumericLength, _MaxNumericLength>
      : false
    : false,
> = _MaxNumericLength extends never
  ? `Error: Invalid length specification "${MaxLengthSpec}". Must be a number or a string representation of a number.`
  : _IsLengthValid extends true
    ? ActualString // Validation passed: the type is the string literal itself
    : `Error: String "${ActualString}" (length: ${_ActualNumericLength}) exceeds maximum length of ${_MaxNumericLength} characters.`
