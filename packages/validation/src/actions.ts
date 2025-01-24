import * as z from "#index.ts"

export const ActionMetadataSchema = z.object({
  actionName: z.string(),
})
export type ActionMetadata = z.infer<typeof ActionMetadataSchema>
