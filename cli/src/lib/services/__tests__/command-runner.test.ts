import { describe, expect, test } from "bun:test"
import * as BunServices from "@effect/platform-bun/BunServices"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as ChildProcessSpawner from "effect/unstable/process/ChildProcessSpawner"
import {
  CommandRunner,
  type CommandRunOptions,
  requireTool,
  runCommand,
} from "#lib/services/command-runner.ts"

function makeRunnerLayer(exitCode: number, calls: CommandRunOptions[]) {
  return Layer.succeed(CommandRunner)({
    run: (options) => {
      calls.push(options)
      return Effect.succeed(ChildProcessSpawner.ExitCode(exitCode))
    },
    string: () => Effect.succeed(""),
  })
}

describe("requireTool", () => {
  test("checks the tool version before use", async () => {
    const calls: CommandRunOptions[] = []
    await Effect.runPromise(requireTool("git").pipe(Effect.provide(makeRunnerLayer(0, calls))))

    expect(calls).toEqual([
      { args: ["--version"], command: "git", stderr: "ignore", stdout: "ignore" },
    ])
  })
})

describe("runCommand", () => {
  test("fails on a nonzero exit code", async () => {
    const error = await Effect.runPromise(
      Effect.flip(
        runCommand({ args: ["install"], command: "bun" }).pipe(
          Effect.provide(makeRunnerLayer(1, []))
        )
      )
    )

    expect(error.message).toContain("failed with exit code 1")
  })
})

describe("getCommandOutput", () => {
  test("fails when a captured command exits nonzero", async () => {
    const commandRunnerLayer = CommandRunner.layer.pipe(Layer.provide(BunServices.layer))
    const error = await Effect.runPromise(
      Effect.flip(
        Effect.gen(function* () {
          const runner = yield* CommandRunner
          return yield* runner.string({ args: ["-e", "process.exit(2)"], command: "bun" })
        }).pipe(Effect.provide(commandRunnerLayer))
      )
    )

    expect(error.message).toContain("failed with exit code 2")
  })
})
