import * as z from "@init/utils/schema"

export const MessageSchemaMap = {
  "test/hello-world": z.object({
    message: z.string(),
  }),
} as const

export type MessageType = keyof typeof MessageSchemaMap
export type MessageBody<T extends MessageType> = z.infer<
  (typeof MessageSchemaMap)[T]
>
