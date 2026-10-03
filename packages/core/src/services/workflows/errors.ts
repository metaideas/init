import * as Faultier from "faultier"

/**
 * Workflows were created, defined, or run out of order. These are programming mistakes, so callers
 * fix the setup instead of handling them at runtime.
 */
export class WorkflowsAlreadyCreatedError extends Faultier.Tagged(
  "WorkflowsAlreadyCreatedError"
)() {}

export class WorkflowDefinedAfterLaunchError extends Faultier.Tagged(
  "WorkflowDefinedAfterLaunchError"
)<{
  workflow: string
}>() {}

export class WorkflowsNotLaunchedError extends Faultier.Tagged("WorkflowsNotLaunchedError")() {}

export const WorkflowsFault = Faultier.registry({
  WorkflowDefinedAfterLaunchError,
  WorkflowsAlreadyCreatedError,
  WorkflowsNotLaunchedError,
})
export type WorkflowsError =
  | WorkflowDefinedAfterLaunchError
  | WorkflowsAlreadyCreatedError
  | WorkflowsNotLaunchedError
