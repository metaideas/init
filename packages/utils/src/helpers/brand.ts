declare const BRAND: unique symbol

/**
 * Creates a new branded type by intersecting a given type with an object
 * containing a unique brand symbol.
 *
 * @template Type - The original type to be branded.
 * @template BrandSymbol - The branding symbol to be applied.
 */
export type Brand<Type, BrandSymbol> = Type & { [BRAND]: BrandSymbol }

/**
 * Computes the type of a branded type, omitting the brand.
 *
 * This can be useful for creating smart constructors that take and validate
 * an unbranded type, then return its branded counterpart.
 *
 * @template T - The branded type.
 */
export type Unbrand<T> = T extends Brand<infer X, unknown> ? X : never

/**
 * Creates a new branded type by intersecting a given type with an object
 * containing a unique brand symbol.
 *
 * @template T - The original type.
 * @template B - The branding symbol to apply.
 * @param {T} value - The value to brand.
 * @param {B} _brand - The branding symbol.
 * @returns {Brand<T, B>} A new branded type.
 */
export function toBrandedType<T, B>(value: T, _brand: B): Brand<T, B> {
  return value as Brand<T, B>
}
