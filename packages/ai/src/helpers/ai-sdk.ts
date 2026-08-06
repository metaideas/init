import type { UIMessage } from "ai"

export * from "@shadcn/helpers/ai-sdk"

export function getMessageText(message: Pick<UIMessage, "parts">) {
  return message.parts.reduce((text, part) => (part.type === "text" ? text + part.text : text), "")
}
