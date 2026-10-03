import * as z from "@init/utils/schema/mini"

export const ShowcaseFormSchema = z.object({
  bio: z.string().check(z.maxLength(160, { error: "Bio must be 160 characters or fewer" })),
  email: z.email({ error: "Enter a valid email address" }),
  name: z.string().check(z.minLength(2, { error: "Name must be at least 2 characters" })),
})
