import type { UIMessage } from "@tanstack/ai-client"

export * from "@shadcn/helpers/tanstack-ai"

export function getMessageText(message: Pick<UIMessage, "parts">) {
  return message.parts.reduce(
    (text, part) => (part.type === "text" ? text + part.content : text),
    ""
  )
}
