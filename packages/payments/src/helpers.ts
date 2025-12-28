import type { Stripe } from "stripe"
import { stripe as env } from "@init/env/presets"
import { kv } from "@init/kv/client"
import { StripeAgentToolkit } from "@stripe/agent-toolkit/ai-sdk"
import { payments } from "./client"

export function createAgentToolkit() {
  return new StripeAgentToolkit({
    configuration: {
      actions: {
        paymentLinks: {
          create: true,
        },
        prices: {
          create: true,
        },
        products: {
          create: true,
        },
      },
    },
    secretKey: env().STRIPE_SECRET_KEY,
  })
}

export type SubscriptionCache =
  | {
      subscriptionId: string | null
      status: Stripe.Subscription.Status
      priceId: string | null
      currentPeriodStart: number | null
      currentPeriodEnd: number | null
      cancelAtPeriodEnd: boolean
      paymentMethod: {
        brand: string | null // E.g., "visa", "mastercard"
        last4: string | null // E.g., "4242"
      } | null
    }
  | {
      status: "none"
    }

export const ALLOWED_EVENTS = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.paused",
  "customer.subscription.resumed",
  "customer.subscription.pending_update_applied",
  "customer.subscription.pending_update_expired",
  "customer.subscription.trial_will_end",
  "invoice.paid",
  "invoice.payment_failed",
  "invoice.payment_action_required",
  "invoice.upcoming",
  "invoice.marked_uncollectible",
  "invoice.payment_succeeded",
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "payment_intent.canceled",
] as const satisfies Stripe.Event.Type[]
type AllowedEvent = (typeof ALLOWED_EVENTS)[number]

export async function syncSubscription(customerId: string): Promise<SubscriptionCache> {
  const cacheKey = ["customer", customerId]
  const cache = kv("payments")

  let data: SubscriptionCache

  // Fetch latest subscription data from Stripe
  const subscriptions = await payments().subscriptions.list({
    customer: customerId,
    expand: ["data.default_payment_method"],
    limit: 1,
    status: "all",
  })

  const subscription = subscriptions.data[0]

  if (!subscription?.items.data[0]) {
    data = { status: "none" }
    await cache.set(cacheKey, data)
    return data
  }

  // Store complete subscription state
  data = {
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    currentPeriodEnd: subscription.items.data[0].current_period_end,
    currentPeriodStart: subscription.items.data[0].current_period_start,
    paymentMethod:
      subscription.default_payment_method && typeof subscription.default_payment_method !== "string"
        ? {
            brand: subscription.default_payment_method.card?.brand ?? null,
            last4: subscription.default_payment_method.card?.last4 ?? null,
          }
        : null,
    priceId: subscription.items.data[0].price.id,
    status: subscription.status,
    subscriptionId: subscription.id,
  }

  // Store the data in your KV
  await cache.set(cacheKey, data)

  return data
}

export function checkIsAllowedEvent(
  event: Stripe.Event
): event is Stripe.Event & { type: AllowedEvent } {
  return ALLOWED_EVENTS.includes(event.type)
}

export async function parseWebhook(request: Request) {
  const signature = request.headers.get("stripe-signature")

  if (typeof signature !== "string") {
    throw new Error("Missing stripe-signature header")
  }

  const body = await request.text()

  const event = payments().webhooks.constructEvent(body, signature, env().STRIPE_WEBHOOK_SECRET)

  if (!checkIsAllowedEvent(event)) {
    throw new Error("Invalid event")
  }

  return event
}
