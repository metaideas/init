import * as z from "./schema"

export const ActionMetadataSchema = z.object({
  actionName: z.string(),
})
export type ActionMetadata = z.infer<typeof ActionMetadataSchema>
