import { createPublishMessage } from "@init/queue/messages"
import { createWorkflowTrigger } from "@init/queue/workflows"

import { buildApiUrl } from "~/shared/utils"

export const getMessageOptions = createPublishMessage(buildApiUrl("/messages"))

export const triggerWorkflow = createWorkflowTrigger(buildApiUrl("/workflows"))
