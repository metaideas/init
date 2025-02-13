import {
  createPublishMessage,
  createPublishRequestBuilder,
} from "@this/queue/messages"
import { createWorkflowTrigger } from "@this/queue/workflows"

import { buildApiUrl } from "~/shared/utils"

export const buildPublishRequest = createPublishRequestBuilder(
  buildApiUrl("/messages")
)

export const publishMessage = createPublishMessage(buildApiUrl("/messages"))

export const triggerWorkflow = createWorkflowTrigger(buildApiUrl("/workflows"))
