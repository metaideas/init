import { Client, type PublishRequest } from "@upstash/qstash"

import env from "@this/env/queue"

import type { MessageBody, MessageType } from "./events"

const client = new Client({
  token: env.QSTASH_TOKEN,
  baseUrl: env.QSTASH_URL,
})

export function createPublishMessage(baseUrl: string) {
  return function getMessageOptions<T extends MessageType>(
    type: T,
    body: MessageBody<T>,
    ...options: Omit<PublishRequest<MessageBody<T>>, "url" | "body">[]
  ) {
    return {
      ...options,
      url: `${baseUrl}/${type}`,
      body,
    }
  }
}

export type { MessageType, MessageBody } from "./events"

export { resend, openai, anthropic } from "@upstash/qstash"

export default client
