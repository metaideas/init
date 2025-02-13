import { Client } from "@upstash/workflow"

import env from "@this/env/queue.server"

import type { TriggerBody, TriggerType } from "./events"

const client = new Client({ token: env.QSTASH_TOKEN })

export function createWorkflowTrigger(baseUrl: string) {
  return function trigger<T extends TriggerType>(
    type: T,
    body: TriggerBody<T>,
    ...options: Omit<Parameters<typeof client.trigger>, "url" | "body">[]
  ) {
    return client.trigger({
      url: `${baseUrl}/${type}`,
      body,
      ...options,
    })
  }
}

export type { TriggerBody, TriggerType } from "./events"

export default client
