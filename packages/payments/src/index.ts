import env from "@this/env/payments.server"
import Stripe from "stripe"

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-01-27.acacia",
})

export type { Stripe } from "stripe"
