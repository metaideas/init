import type * as zod from "@init/utils/schema"
import type * as z from "@init/utils/schema"
import type { UnionToIntersection } from "@init/utils/type"
import type { Client, Receiver } from "@upstash/qstash"

/**
 * Type helper to infer the payload type from a Zod schema.
 */
export type InferPayload<T extends zod.core.$ZodType> = zod.infer<T>

type ProxyCallbackOptions = {
  path: readonly string[]
  args: readonly unknown[]
}

export type ProxyCallback = (opts: ProxyCallbackOptions) => unknown

/**
 * Type for a leaf node in the messages proxy.
 * Each leaf exposes `options`, `path`, and `schema`.
 */
export type MessageLeaf<T extends zod.core.$ZodType> = {
  /**
   * Publish a message with the typed payload.
   * For now, this is a stub that returns the path and payload.
   */
  options: (payload: InferPayload<T>) => {
    url: string
    body: InferPayload<T>
  }
  /**
   * The dotted path to this event (e.g., "stripe.checkout.created").
   */
  $path: string
  /**
   * The Zod schema for this event.
   */
  $schema: T
  /**
   * The function to publish this event.
   */
  publish: (body: InferPayload<T>) => ReturnType<Client["publishJSON"]>
}

/**
 * Type for the nested messages proxy. Recursively creates nested objects until
 * reaching a Zod schema leaf.
 */
export type MessageProxy<T> = T extends zod.core.$ZodType
  ? MessageLeaf<T>
  : T extends Record<string, unknown>
    ? {
        [K in keyof T]: K extends string ? MessageProxy<T[K]> : never
      }
    : never

/**
 * Type for the events schema.
 */
export type EventsSchema = {
  [K in string]: z.core.$ZodType | EventsSchema
}

export type FlattenedEventsSchema<
  Events extends EventsSchema,
  Prefix extends string = "",
> = UnionToIntersection<
  {
    [K in keyof Events]: Events[K] extends z.core.$ZodType
      ? { [P in `${Prefix}${K & string}`]: Events[K] }
      : Events[K] extends EventsSchema
        ? FlattenedEventsSchema<Events[K], `${Prefix}${K & string}.`>
        : never
  }[keyof Events]
>

/**
 * Gets all message type paths (keys) from a flattened events schema.
 */
export type MessageType<Events extends EventsSchema> =
  keyof FlattenedEventsSchema<Events>

export type ClientConfig = Pick<
  NonNullable<ConstructorParameters<typeof Client>[0]>,
  "token"
>

export type ReceiverConfig = Pick<
  NonNullable<ConstructorParameters<typeof Receiver>[0]>,
  "currentSigningKey" | "nextSigningKey"
>
