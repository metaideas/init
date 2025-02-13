import { Client } from "@upstash/workflow"

import env from "@this/env/queue.server"

import type { TriggerBody, TriggerType } from "./events"

export function createWorkflowClient<U extends string>(baseUrl: U) {
  const client = new Client({ token: env.QSTASH_TOKEN })

  return {
    /**
     * A type-safe function to trigger workflows
     */
    triggerWorkflow: function trigger<T extends TriggerType>(
      type: T,
      body: TriggerBody<T>,
      options?: Parameters<typeof client.trigger>[0]
    ) {
      return client.trigger({ ...options, url: `${baseUrl}/${type}`, body })
    },
    client,
  }
}

export type { TriggerBody } from "./events"
