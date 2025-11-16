import * as z from "zod"
import type * as zod from "@init/utils/schema"

/**
 * Type helper to check if a value is a Zod schema.
 * A leaf node in the nested events tree is any Zod schema type.
 */
function isZodType(value: unknown): value is zod.core.$ZodType {
  return value instanceof z.ZodType
}

/**
 * Type helper to extract all possible dotted paths from a nested events object.
 * 
 * @example
 * ```ts
 * type Paths = NestedEventPaths<{
 *   stripe: {
 *     checkout: { created: z.object({ id: z.string() }) }
 *   }
 * }>
 * // Result: "stripe.checkout.created"
 * ```
 */
type NestedEventPaths<
  T,
  Prefix extends string = "",
> = T extends zod.core.$ZodType
  ? Prefix
  : T extends Record<string, unknown>
    ? {
        [K in keyof T]: K extends string
          ? NestedEventPaths<
              T[K],
              Prefix extends "" ? K : `${Prefix}.${K}`
            >
          : never
      }[keyof T]
    : never

/**
 * Type helper to get the Zod schema at a specific path.
 * 
 * @example
 * ```ts
 * type Schema = NestedEventAtPath<
 *   { stripe: { checkout: { created: z.object({ id: z.string() }) } } },
 *   "stripe.checkout.created"
 * >
 * ```
 */
type NestedEventAtPath<
  T,
  Path extends string,
> = Path extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? NestedEventAtPath<T[Key], Rest>
    : never
  : Path extends keyof T
    ? T[Path] extends zod.core.$ZodType
      ? T[Path]
      : never
    : never

/**
 * Type helper to infer the payload type from a Zod schema.
 */
type InferPayload<T extends zod.core.$ZodType> = z.infer<T>

/**
 * Type for a leaf node in the messages proxy.
 * Each leaf exposes `publish`, `path`, and `schema`.
 */
type MessageLeaf<T extends zod.core.$ZodType> = {
  /**
   * Publish a message with the typed payload.
   * For now, this is a stub that returns the path and payload.
   */
  publish: (payload: InferPayload<T>) => { path: string; payload: InferPayload<T> }
  /**
   * The dotted path to this event (e.g., "stripe.checkout.created").
   */
  path: string
  /**
   * The Zod schema for this event.
   */
  schema: T
}

/**
 * Type for the nested messages proxy.
 * Recursively creates nested objects until reaching a Zod schema leaf.
 */
type MessagesProxy<T> = T extends zod.core.$ZodType
  ? MessageLeaf<T>
  : T extends Record<string, unknown>
    ? {
        [K in keyof T]: K extends string ? MessagesProxy<T[K]> : never
      }
    : never

/**
 * Recursively flatten a nested events object into a flat map with dotted paths.
 * 
 * @example
 * ```ts
 * const events = {
 *   stripe: {
 *     checkout: { created: z.object({ id: z.string() }) }
 *   }
 * }
 * const flat = flattenEvents(events)
 * // Result: { "stripe.checkout.created": z.object({ id: z.string() }) }
 * ```
 */
export function flattenEvents<T extends Record<string, unknown>>(
  events: T,
  prefix = "",
): Record<string, zod.core.$ZodType> {
  const result: Record<string, zod.core.$ZodType> = {}

  for (const [key, value] of Object.entries(events)) {
    const path = prefix ? `${prefix}.${key}` : key

    if (isZodType(value)) {
      result[path] = value
    } else if (typeof value === "object" && value !== null) {
      Object.assign(result, flattenEvents(value as Record<string, unknown>, path))
    }
  }

  return result
}

/**
 * Create a typed messages proxy from a nested events schema.
 * 
 * @example
 * ```ts
 * const events = defineEvents({
 *   stripe: {
 *     checkout: { created: z.object({ id: z.string() }) }
 *   }
 * })
 * 
 * const messages = createMessages(events)
 * 
 * // Type-safe publish with inferred payload type
 * const result = messages.stripe.checkout.created.publish({ id: "123" })
 * // result.path === "stripe.checkout.created"
 * ```
 */
export function createMessages<T extends Record<string, unknown>>(
  events: T,
  prefix = "",
): MessagesProxy<T> {
  return new Proxy({} as MessagesProxy<T>, {
    get(_target, prop: string) {
      const currentPath = prefix ? `${prefix}.${prop}` : prop
      const value = (events as Record<string, unknown>)[prop]

      if (isZodType(value)) {
        // Leaf node - return message leaf with publish, path, and schema
        return {
          publish: (payload: z.infer<typeof value>) => ({
            path: currentPath,
            payload,
          }),
          path: currentPath,
          schema: value,
        }
      }

      if (typeof value === "object" && value !== null) {
        // Nested object - recurse
        return createMessages(value as Record<string, unknown>, currentPath)
      }

      return undefined
    },
  })
}

/**
 * Define events schema with preserved literal types.
 * This is a type-preserving identity function.
 * 
 * @example
 * ```ts
 * const events = defineEvents({
 *   stripe: {
 *     checkout: { created: z.object({ id: z.string() }) }
 *   }
 * })
 * ```
 */
export function defineEvents<T extends Record<string, unknown>>(events: T): T {
  return events
}

/**
 * Alias for `flattenEvents` to be used with `buildMessageClient`'s events parameter.
 * 
 * @example
 * ```ts
 * const nestedEvents = defineEvents({ stripe: { checkout: { created: z.object({}) } } })
 * const flatEvents = toFlatMap(nestedEvents)
 * const client = buildMessageClient({ events: flatEvents, ... })
 * ```
 */
export const toFlatMap = flattenEvents

