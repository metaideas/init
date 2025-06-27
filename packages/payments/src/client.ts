import { singleton } from "@init/utils/singleton"
import Stripe from "stripe"

export function createPayments(secretKey: string, webhookSecret: string) {
  const client = singleton(
    "payments",
    () => new Stripe(secretKey, { apiVersion: "2025-02-24.acacia" })
  )

  async function parsePaymentWebhook(request: Request): Promise<Stripe.Event> {
    const signature = request.headers.get("stripe-signature")

    if (typeof signature !== "string") {
      throw new Error("Missing stripe-signature header")
    }

    const body = await request.text()

    const event = client.webhooks.constructEvent(body, signature, webhookSecret)

    return event
  }

  return { client, parsePaymentWebhook }
}

export type { Stripe } from "stripe"
