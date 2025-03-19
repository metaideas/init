import type { Stripe } from "@init/payments"
import * as z from "@init/utils/schema"

export const MessageSchemaMap = {
  "stripe/process-webhook-event": z.object({
    /**
     * The webhook event payload.
     */
    stripeEvent: z.custom<Stripe.Event>(),
    /**
     * The webhook event ID. Use it to mark the event as processed.
     */
    webhookEventId: z.string(),
  }),
  "test/hello-world": z.object({
    message: z.string(),
  }),
} as const

export type MessageType = keyof typeof MessageSchemaMap
export type MessageBody<T extends MessageType> = z.infer<
  (typeof MessageSchemaMap)[T]
>
