import { z } from "@init/utils/schema"

export const HelloWorldBodySchema = z.object({
  name: z.string(),
})

export const TriggerSchemaMap = {
  "test/hello-world": HelloWorldBodySchema,
  "test/workflow": HelloWorldBodySchema,
} as const

export type TriggerType = keyof typeof TriggerSchemaMap
export type TriggerBody<T extends TriggerType> = z.infer<
  (typeof TriggerSchemaMap)[T]
>
