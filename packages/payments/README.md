<div align="center">
  <h1 align="center"><code>@init/payments</code></h1>
</div>

Stripe payments with a subscription cache, built with [Stripe](https://stripe.com/) and [unstorage](https://unstorage.unjs.io/).

```ts
import { createPayments } from "@init/payments/client"

const payments = createPayments({
  secretKey: ENV.STRIPE_SECRET_KEY,
  storage,
  webhookSecret: ENV.STRIPE_WEBHOOK_SECRET,
})

const event = await payments.parseWebhook(request)

if (event instanceof InvalidWebhookError) {
  return new Response(event.message, { status: 400 })
}
```

Stripe stays the source of truth. Webhook handlers call `syncSubscription(customerId)` to cache the latest subscription in `storage`, and `getSubscription(customerId)` reads the cache, falling back to Stripe on a miss. Pass any unstorage instance, such as the Redis instance of `apps/api`, or `createStorage()` for an in-memory cache in tests.
