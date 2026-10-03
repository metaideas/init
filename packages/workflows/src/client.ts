import { DBOS, type DBOSConfig, type DLogger } from "@dbos-inc/dbos-sdk"
import { log } from "@init/observability/logger"

export class Workflows<Queue extends string = never> {
  static #isCreated = false

  readonly #queues: Record<string, QueueOptions>
  #isLaunched = false

  constructor(options: WorkflowsOptions<Queue>) {
    if (Workflows.#isCreated) {
      throw new Error("Workflows can only be created once per process")
    }

    Workflows.#isCreated = true
    this.#queues = options.queues ?? {}

    DBOS.setConfig({
      logger: workflowLogger,
      name: options.name ?? "init",
      ...("pool" in options
        ? { systemDatabasePool: options.pool }
        : { systemDatabaseUrl: options.url }),
    })
  }

  define<Input, Result>(name: string, handler: (input: Input) => Promise<Result>) {
    if (this.#isLaunched) {
      throw new Error(`Workflow "${name}" must be defined before workflows launch`)
    }

    return DBOS.registerWorkflow(handler, { name })
  }

  // oxlint-disable-next-line class-methods-use-this -- DBOS resolves the running workflow from async context.
  step<Result>(
    name: string,
    operation: () => Result | Promise<Result>,
    options: StepOptions = {}
  ): Promise<Result> {
    const { attempts = 1, backoff, delaySeconds, timeoutMs } = options

    return DBOS.runStep(async () => operation(), {
      backoffRate: backoff,
      intervalSeconds: delaySeconds,
      maxAttempts: attempts,
      name,
      retriesAllowed: attempts > 1,
      timeoutMS: timeoutMs,
    })
  }

  // oxlint-disable-next-line class-methods-use-this -- DBOS resolves the running workflow from async context.
  sleep(milliseconds: number) {
    return DBOS.sleep(milliseconds)
  }

  async run<Input, Result>(
    workflow: (input: Input) => Promise<Result>,
    input: Input,
    { id, queue }: RunOptions<Queue> = {}
  ): Promise<WorkflowRun<Result>> {
    if (!this.#isLaunched) {
      throw new Error("Workflows must launch before a workflow can run")
    }

    const handle = await DBOS.startWorkflow(workflow, { queueName: queue, workflowID: id })(input)

    return { id: handle.workflowID, result: () => handle.getResult() }
  }

  async launch() {
    await DBOS.launch()
    await Promise.all(
      Object.entries(this.#queues).map(([name, { concurrency }]) =>
        DBOS.registerQueue(name, { globalConcurrency: concurrency })
      )
    )
    this.#isLaunched = true
  }

  async shutdown() {
    if (!this.#isLaunched) {
      return
    }

    await DBOS.shutdown()
    this.#isLaunched = false
  }
}

// DBOS logs entries as strings or objects; fold both into one structured event.
function toEvent(entry: unknown): Record<string, unknown> {
  if (typeof entry === "string") {
    return { message: entry }
  }

  if (entry instanceof Error) {
    return { error: entry }
  }

  return { details: entry }
}

const workflowLogger: DLogger = {
  debug: (entry) => {
    log.debug({ scope: "workflows", ...toEvent(entry) })
  },
  error: (entry) => {
    log.error({ scope: "workflows", ...toEvent(entry) })
  },
  info: (entry) => {
    log.info({ scope: "workflows", ...toEvent(entry) })
  },
  warn: (entry) => {
    log.warn({ scope: "workflows", ...toEvent(entry) })
  },
}

type Pool = NonNullable<DBOSConfig["systemDatabasePool"]>

type WorkflowsOptions<Queue extends string> = ({ pool: Pool } | { url: string }) & {
  name?: string
  queues?: Record<Queue, QueueOptions>
}

type QueueOptions = { concurrency?: number }

type StepOptions = {
  attempts?: number
  backoff?: number
  delaySeconds?: number
  timeoutMs?: number
}

type RunOptions<Queue extends string> = { id?: string; queue?: Queue }

export type WorkflowRun<Result> = { id: string; result: () => Promise<Result> }
