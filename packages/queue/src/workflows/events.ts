import { z } from "@this/utils/schema"

export const HelloWorldBodySchema = z.object({
  name: z.string(),
})

export const TriggerSchemaMap = {
  "test/hello-world": HelloWorldBodySchema,
} as const

export type TriggerType = keyof typeof TriggerSchemaMap
export type TriggerBody<T extends TriggerType> = z.infer<
  (typeof TriggerSchemaMap)[T]
>
