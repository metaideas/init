import { describe, expect, test } from "bun:test"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as ChildProcessSpawner from "effect/unstable/process/ChildProcessSpawner"
import { getFileDiff } from "#commands/update.ts"
import { CommandRunner } from "#lib/services/command-runner.ts"

function makeRunnerLayer(exitCodes: number[]) {
  let index = 0
  return Layer.succeed(CommandRunner)({
    run: () => {
      const exitCode = exitCodes[index] ?? 0
      index += 1
      return Effect.succeed(ChildProcessSpawner.ExitCode(exitCode))
    },
    string: () => Effect.succeed(""),
  })
}

describe("getFileDiff", () => {
  test("updates unchanged files and preserves locally changed files", async () => {
    const result = await Effect.runPromise(
      getFileDiff(["changed.ts", "unchanged.ts"], ["changed.ts", "unchanged.ts", "new.ts"]).pipe(
        Effect.provide(makeRunnerLayer([1, 0]))
      )
    )

    expect(result).toEqual({ filesToUpdate: ["unchanged.ts"], newFiles: ["new.ts"] })
  })

  test("fails when git diff returns an operational error", async () => {
    const error = await Effect.runPromise(
      Effect.flip(getFileDiff(["file.ts"], ["file.ts"]).pipe(Effect.provide(makeRunnerLayer([2]))))
    )
    expect(error.message).toContain("failed with exit code 2")
  })

  test("excludes internal template paths", async () => {
    const result = await Effect.runPromise(
      getFileDiff([], ["cli/src/index.ts", ".github/workflows/cli.yml", "README.md"]).pipe(
        Effect.provide(makeRunnerLayer([]))
      )
    )

    expect(result).toEqual({ filesToUpdate: [], newFiles: ["README.md"] })
  })
})
