import { z } from "zod"

export const ActionMetadataSchema = z.object({
  actionName: z.string(),
})
export type ActionMetadata = z.infer<typeof ActionMetadataSchema>
