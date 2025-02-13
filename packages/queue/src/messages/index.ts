import { Client } from "@upstash/qstash"

import env from "@this/env/queue.server"

import type { MessageBody, MessageType } from "./events"

export function createMessageClient<U extends string>(baseUrl: U) {
  const client = new Client({
    token: env.QSTASH_TOKEN,
    baseUrl: env.QSTASH_URL,
  })

  return {
    publishMessage: <T extends MessageType>(type: T, body: MessageBody<T>) =>
      client.publishJSON({ url: `${baseUrl}/${type}`, body }),
    batchMessages: <T extends MessageType>(
      requests: {
        type: T
        body: MessageBody<T>
      }[]
    ) => client.batchJSON(requests),
    buildRequest: <T extends MessageType>(
      type: T,
      body: MessageBody<T>
    ): { url: `${U}/${T}`; body: MessageBody<T> } => ({
      url: `${baseUrl}/${type}`,
      body,
    }),
    client,
  }
}

export { resend, openai, anthropic } from "@upstash/qstash"
