import { createMessageClient } from "@this/queue/messages"
import { createWorkflowClient } from "@this/queue/workflows"

import { buildApiUrl } from "~/shared/utils"

export const {
  publishMessage,
  batchMessages,
  client: messageClient,
  buildRequest,
} = createMessageClient(buildApiUrl("/messages"))

export const { triggerWorkflow, client: workflowClient } = createWorkflowClient(
  buildApiUrl("/workflows")
)
