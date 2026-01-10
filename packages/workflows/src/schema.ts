import * as z from "@init/utils/schema"
import { EventSchemas } from "inngest"

export default new EventSchemas().fromSchema({
  "demo/email.sent": z.object({
    email: z.email(),
    userId: z.string(),
  }),
})
