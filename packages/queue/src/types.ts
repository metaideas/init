import type * as z from "@init/utils/schema"
import type { UnionToIntersection } from "@init/utils/type"
import type { Client as QstashClient, Receiver } from "@upstash/qstash"
import type {
  TriggerOptions,
  Client as WorkflowClient,
} from "@upstash/workflow"

export type MessageLeaf<T extends z.core.$ZodType> = {
  /**
   * Helper that returns the URL and body payload for publishing.
   */
  options: (payload: z.core.infer<T>) => {
    url: string
    body: z.core.infer<T>
  }

  /**
   * The function to publish this event.
   */
  publish: (body: z.core.infer<T>) => ReturnType<QstashClient["publishJSON"]>

  /**
   * The dotted path to this event (e.g., "stripe.checkout.created").
   *
   * Resolved via the recursive proxy when the `$path` property is accessed.
   */
  $path: string

  /**
   * The Zod schema for this event.
   *
   * Resolved via the recursive proxy when the `$schema` property is accessed.
   */
  $schema: T
}

/**
 * Type for the nested messages proxy. Recursively creates nested objects until
 * reaching a Zod schema leaf.
 */
export type MessageProxy<T> = T extends z.core.$ZodType
  ? MessageLeaf<T>
  : T extends Record<string, unknown>
    ? {
        [K in keyof T]: K extends string ? MessageProxy<T[K]> : never
      }
    : never

export type WorkflowLeaf<T extends z.core.$ZodType> = {
  /**
   * Helper that returns the URL and body payload for triggering.
   */
  options: (payload: z.core.infer<T>) => {
    url: string
    body: z.core.infer<T>
  }

  /**
   * The path to this workflow endpoint (e.g., "stripe/checkout").
   *
   * Resolved via the recursive proxy when the `$path` property is accessed.
   */
  $path: string

  /**
   * The Zod schema for this workflow.
   *
   * Resolved via the recursive proxy when the `$schema` property is accessed.
   */
  $schema: T

  /**
   * The function to trigger this workflow.
   */
  trigger: (
    body: z.core.infer<T>,
    options?: Omit<TriggerOptions, "url" | "body">
  ) => ReturnType<WorkflowClient["trigger"]>
}

/**
 * Type for the nested messages proxy. Recursively creates nested objects until
 * reaching a Zod schema leaf.
 */
export type WorkflowProxy<T> = T extends z.core.$ZodType
  ? WorkflowLeaf<T>
  : T extends Record<string, unknown>
    ? {
        [K in keyof T]: K extends string ? WorkflowProxy<T[K]> : never
      }
    : never

/**
 * Type for the events schema.
 */
export type RequestsSchema = {
  [K in string]: z.core.$ZodType | RequestsSchema
}

export type FlattenedRequestsSchema<
  Events extends RequestsSchema,
  Prefix extends string = "",
> = UnionToIntersection<
  {
    [K in keyof Events]: Events[K] extends z.core.$ZodType
      ? { [P in `${Prefix}${K & string}`]: Events[K] }
      : Events[K] extends RequestsSchema
        ? FlattenedRequestsSchema<Events[K], `${Prefix}${K & string}.`>
        : never
  }[keyof Events]
>

/**
 * Gets all message type paths (keys) from a flattened events schema.
 */
export type RequestType<TRequest extends RequestsSchema> =
  keyof FlattenedRequestsSchema<TRequest>

export type MessageClientConfig<TRequest extends RequestsSchema> = {
  baseUrl: string
  events: TRequest
} & Pick<NonNullable<ConstructorParameters<typeof QstashClient>[0]>, "token"> & // Client configuration
  // Receiver configuration
  Pick<
    NonNullable<ConstructorParameters<typeof Receiver>[0]>,
    "currentSigningKey" | "nextSigningKey"
  >

export type WorkflowClientConfig<TEvents extends RequestsSchema> = {
  baseUrl: string
  events: TEvents
} & Pick<NonNullable<ConstructorParameters<typeof WorkflowClient>[0]>, "token"> // Client configuration
