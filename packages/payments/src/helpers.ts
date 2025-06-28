import type { Redis } from "@init/kv/client"
import { buildKeyGenerator } from "@init/utils/key"
import { StripeAgentToolkit } from "@stripe/agent-toolkit/ai-sdk"
import type { Stripe } from "stripe"

const generateKey = buildKeyGenerator<"stripe", "customer" | "subscription">()

export function createAgentToolkit(secretKey: string) {
  return new StripeAgentToolkit({
    secretKey,
    configuration: {
      actions: {
        paymentLinks: {
          create: true,
        },
        products: {
          create: true,
        },
        prices: {
          create: true,
        },
      },
    },
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
        brand: string | null // e.g., "visa", "mastercard"
        last4: string | null // e.g., "4242"
      } | null
    }
  | {
      status: "none"
    }

export const ALLOWED_EVENTS: Stripe.Event.Type[] = [
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
]

export function buildSubscriptionHelpers(client: Stripe, kv: Redis) {
  async function syncSubscription(
    customerId: string
  ): Promise<SubscriptionCache> {
    const cacheKey = generateKey("stripe", "customer", customerId)

    // Fetch latest subscription data from Stripe
    const subscriptions = await client.subscriptions.list({
      customer: customerId,
      limit: 1,
      status: "all",
      expand: ["data.default_payment_method"],
    })

    if (subscriptions.data.length === 0) {
      const data: SubscriptionCache = { status: "none" }

      await kv.set(cacheKey, data)

      return data
    }

    const subscription = subscriptions.data[0]

    // Store complete subscription state
    const data: SubscriptionCache = {
      subscriptionId: subscription.id,
      status: subscription.status,
      priceId: subscription.items.data[0].price.id,
      currentPeriodEnd: subscription.items.data[0].current_period_end,
      currentPeriodStart: subscription.items.data[0].current_period_start,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      paymentMethod:
        subscription.default_payment_method &&
        typeof subscription.default_payment_method !== "string"
          ? {
              brand: subscription.default_payment_method.card?.brand ?? null,
              last4: subscription.default_payment_method.card?.last4 ?? null,
            }
          : null,
    }

    // Store the data in your KV
    await kv.set(cacheKey, data)

    return data
  }

  function checkIsAllowedEvent(event: Stripe.Event): boolean {
    return ALLOWED_EVENTS.includes(event.type)
  }

  return { syncSubscription, checkIsAllowedEvent }
}
