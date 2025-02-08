import * as z from "zod"

// Create custom zod types here and import them to other packages under the `z` namespace.

export function booleanLike() {
  return z.preprocess(val => val === "true" || val === "1", z.boolean())
}

export function env() {
  return z.enum(["development", "production", "test"])
}

export function conditional<T extends z.ZodTypeAny>(
  condition: boolean,
  schema: T
) {
  return z.lazy(() => (condition ? schema.optional() : schema))
}

export * from "zod"
