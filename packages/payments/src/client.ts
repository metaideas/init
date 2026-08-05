import { singleton } from "@init/utils/singleton"
import Stripe from "stripe"
import { ENV } from "#env.generated.ts"

export function payments() {
  return singleton(
    "payments",
    () => new Stripe(ENV.STRIPE_SECRET_KEY, { apiVersion: "2025-12-15.clover" })
  )
}

export type { Stripe } from "stripe"
