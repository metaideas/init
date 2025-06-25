import type * as z from "@init/utils/schema"
import { Client } from "@upstash/workflow"

type TriggersSchema = Record<string, z.ZodType>
type TriggerType<Triggers extends TriggersSchema> = keyof Triggers & string
type TriggerBody<
  Triggers extends TriggersSchema,
  T extends TriggerType<Triggers>,
> = z.infer<Triggers[T]>

type WorkflowClientConfig = {
  token: string
}

type WorkflowClientOptions<Triggers extends TriggersSchema> = {
  baseUrl: string
  triggers: Triggers
}

export function createWorkflowClient<Triggers extends TriggersSchema>(
  config: WorkflowClientConfig,
  options: WorkflowClientOptions<Triggers>
) {
  const client = new Client({ token: config.token })

  function getTriggerBody<T extends TriggerType<Triggers>>(
    type: T,
    body: TriggerBody<Triggers, T>
  ) {
    return {
      url: `${options.baseUrl}/${type}`,
      body,
    }
  }

  return {
    client,
    getTriggerBody,
  }
}
