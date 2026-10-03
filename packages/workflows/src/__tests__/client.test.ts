import { describe, expect, mock, test } from "bun:test"
import { WorkflowsNotLaunchedError } from "@v1/core/errors"

const queueRegistration = Promise.withResolvers<undefined>()

await mock.module("@dbos-inc/dbos-sdk", () => ({
  DBOS: {
    launch: () => Promise.resolve(),
    registerQueue: () => queueRegistration.promise,
    registerWorkflow: <Handler>(handler: Handler) => handler,
    setConfig: mock(),
    shutdown: () => Promise.resolve(),
    startWorkflow:
      <Input, Result>(workflow: (input: Input) => Promise<Result>) =>
      (input: Input) =>
        Promise.resolve({ getResult: () => workflow(input), workflowID: "child" }),
  },
}))

const { Workflows } = await import("#client.ts")

const workflows = new Workflows({
  queues: { default: { concurrency: 1 } },
  url: "postgresql://localhost/test",
})
const child = workflows.define("child", (input: number) => Promise.resolve(input * 2))

describe("Workflows.run", () => {
  test("starts workflows once the engine launches, before queues finish registering", async () => {
    const earlyError = await workflows.run(child, 1).catch((error: unknown) => error)
    expect(earlyError).toBeInstanceOf(WorkflowsNotLaunchedError)

    const launching = workflows.launch()
    await Promise.resolve()

    const run = await workflows.run(child, 21)
    expect(run.id).toBe("child")
    expect(await run.result()).toBe(42)

    queueRegistration.resolve()
    await launching
  })
})
