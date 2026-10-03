import Stripe from "stripe"
import { ENV } from "#env.generated.ts"

let client: Stripe | undefined

export function payments() {
  return (client ??= new Stripe(ENV.STRIPE_SECRET_KEY, { apiVersion: "2025-12-15.clover" }))
}

export type { Stripe } from "stripe"
