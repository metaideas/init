import { stripe as env } from "@init/env/presets"
import { singleton } from "@init/utils/singleton"
import Stripe from "stripe"

export function payments() {
  return singleton(
    "payments",
    () =>
      new Stripe(env().STRIPE_SECRET_KEY, { apiVersion: "2025-07-30.basil" })
  )
}

export type { Stripe } from "stripe"
