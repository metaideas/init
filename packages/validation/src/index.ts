// Create custom zod types here and import them to other packages under the `z` namespace.

import * as z from "zod"
export * from "zod"

export function booleanLike() {
  return z.preprocess(val => val === "true" || val === "1", z.boolean())
}

export function env() {
  return z.enum(["development", "production", "test"])
}
