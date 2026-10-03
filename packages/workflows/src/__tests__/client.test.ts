import type { DBOSConfig, DBOSSpan } from "@dbos-inc/dbos-sdk"
import { describe, expect, mock, test } from "bun:test"

const queueRegistration = Promise.withResolvers<undefined>()
const setConfig = mock<(config: DBOSConfig) => void>()
const log = { debug: mock(), error: mock(), info: mock(), warn: mock() }

await mock.module("@dbos-inc/dbos-sdk", () => ({
  DBOS: {
    launch: () => Promise.resolve(),
    registerQueue: () => queueRegistration.promise,
    registerWorkflow: <Handler>(handler: Handler) => handler,
    setConfig,
    shutdown: () => Promise.resolve(),
    startWorkflow:
      <Input, Result>(workflow: (input: Input) => Promise<Result>) =>
      (input: Input) =>
        Promise.resolve({ getResult: () => workflow(input), workflowID: "child" }),
  },
}))

const { Workflows } = await import("#client.ts")

const workflows = new Workflows({
  logger: log,
  queues: { default: { concurrency: 1 } },
  url: "postgresql://localhost/test",
})
const child = workflows.define("child", (input: number) => Promise.resolve(input * 2))

describe("Workflows.run", () => {
  test("starts workflows once the engine launches, before queues finish registering", async () => {
    const earlyError = await workflows.run(child, 1).catch((error: unknown) => error)
    expect(earlyError).toBeInstanceOf(Error)

    const launching = workflows.launch()
    await Promise.resolve()

    const run = await workflows.run(child, 21)
    expect(run.id).toBe("child")
    expect(await run.result()).toBe(42)

    queueRegistration.resolve()
    await launching
  })
})

describe("workflowLogger", () => {
  test("keeps the error and workflow attributes that DBOS passes as metadata", () => {
    const logger = setConfig.mock.calls[0]?.[0].logger
    const error = new Error("step failed")
    const span: DBOSSpan = {
      addEvent: () => span,
      attributes: { "dbos.operation.workflow_id": "run-1" },
      setAttribute: () => span,
      setStatus: () => span,
    }

    logger?.error("step failed", { error, span, stack: error.stack })

    expect(log.error).toHaveBeenCalledWith({
      error,
      message: "step failed",
      scope: "workflows",
      workflow: { "dbos.operation.workflow_id": "run-1" },
    })
  })

  test("keeps the stack when DBOS logs an error without an Error object", () => {
    const logger = setConfig.mock.calls[0]?.[0].logger

    logger?.error("queue failed", { stack: "at dispatch" })

    expect(log.error).toHaveBeenCalledWith({
      message: "queue failed",
      scope: "workflows",
      stack: "at dispatch",
    })
  })
})
