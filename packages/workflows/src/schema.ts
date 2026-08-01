import * as z from "@init/utils/schema"
import { eventType } from "inngest"

export const demoEmailSent = eventType("demo/email.sent", {
  schema: z.object({
    email: z.email(),
    userId: z.string(),
  }),
})

const events = { demoEmailSent }

export default events

export type Events = typeof events
