import { createPublishMessage } from "@this/queue/messages"
import { createWorkflowTrigger } from "@this/queue/workflows"

import { buildApiUrl } from "~/shared/utils"

export const getMessageOptions = createPublishMessage(buildApiUrl("/messages"))

export const triggerWorkflow = createWorkflowTrigger(buildApiUrl("/workflows"))
