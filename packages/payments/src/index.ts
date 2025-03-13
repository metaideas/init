import Stripe from "stripe"

import env from "@this/env/payments"

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia",
})

export type { Stripe } from "stripe"
