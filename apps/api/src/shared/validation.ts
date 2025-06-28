import { type UserId, users } from "@init/db/schema"
import * as z from "@init/utils/schema"
import { createSelectSchema } from "drizzle-zod"

export const PublicUserSchema = createSelectSchema(users, {
  id: z.string().brand<UserId>(),
}).omit({
  metadata: true,
})
