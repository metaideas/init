import arcjet, { type ArcjetOptions, type Primitive, type Product, shield } from "@arcjet/bun"
import { arcjet as env } from "@init/env/presets"
import { getLogger } from "@init/observability/logger"

export function secure<
  const Rules extends (Primitive | Product)[],
  const Characteristics extends readonly string[],
>(options?: Pick<ArcjetOptions<Rules, Characteristics>, "rules" | "characteristics">) {
  const rules = options?.rules ?? ([] as Array<Primitive | Product>)
  const characteristics = options?.characteristics ?? []

  return arcjet({
    characteristics: [...characteristics, "ip.src"],
    key: env().ARCJET_KEY,
    log: getLogger(["security"]),
    rules: [...rules, shield({ mode: "LIVE" })],
  })
}
