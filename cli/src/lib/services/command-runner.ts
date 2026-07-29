import type * as PlatformError from "effect/PlatformError"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Stream from "effect/Stream"
import * as ChildProcess from "effect/unstable/process/ChildProcess"
import * as ChildProcessSpawner from "effect/unstable/process/ChildProcessSpawner"
import { CliNotFound, CommandFailed } from "#lib/core/errors.ts"

export type CommandRunOptions = {
  readonly args: readonly string[]
  readonly command: string
  readonly cwd?: string
  readonly stderr?: "ignore" | "inherit"
  readonly stdin?: "ignore" | "inherit"
  readonly stdout?: "ignore" | "inherit"
}

type CommandRunnerError = CliNotFound | PlatformError.PlatformError

function mapCommandError(command: string, cause: PlatformError.PlatformError) {
  return cause.reason._tag === "NotFound" ? new CliNotFound({ command }) : cause
}

export class CommandRunner extends Context.Service<
  CommandRunner,
  {
    readonly run: (
      options: CommandRunOptions
    ) => Effect.Effect<ChildProcessSpawner.ExitCode, CommandRunnerError>
    readonly string: (
      options: Omit<CommandRunOptions, "stdout">
    ) => Effect.Effect<string, CommandFailed | CommandRunnerError>
  }
>()("CommandRunner") {
  static readonly layer = Layer.effect(
    this,
    Effect.gen(function* () {
      const spawner = yield* ChildProcessSpawner.ChildProcessSpawner

      return {
        run: ({
          args,
          command,
          cwd,
          stderr = "inherit",
          stdin = "ignore",
          stdout = "inherit",
        }: CommandRunOptions) =>
          spawner
            .exitCode(ChildProcess.make(command, args, { cwd, stderr, stdin, stdout }))
            .pipe(Effect.mapError((cause) => mapCommandError(command, cause))),
        string: ({
          args,
          command,
          cwd,
          stderr = "ignore",
          stdin = "ignore",
        }: Omit<CommandRunOptions, "stdout">) =>
          Effect.scoped(
            Effect.gen(function* () {
              const handle = yield* spawner.spawn(
                ChildProcess.make(command, args, { cwd, stderr, stdin, stdout: "pipe" })
              )
              const [output, exitCode] = yield* Effect.all(
                [Stream.mkString(handle.stdout.pipe(Stream.decodeText())), handle.exitCode],
                { concurrency: 2 }
              )
              if (Number(exitCode) !== 0) {
                return yield* Effect.fail(new CommandFailed({ command, exitCode }))
              }
              return output
            })
          ).pipe(
            Effect.mapError((cause) =>
              cause._tag === "CommandFailed" ? cause : mapCommandError(command, cause)
            )
          ),
      }
    })
  )
}

export const runCommand = Effect.fn("runCommand")(function* (options: CommandRunOptions) {
  const runner = yield* CommandRunner
  const exitCode = yield* runner.run(options)
  if (Number(exitCode) !== 0) {
    return yield* Effect.fail(new CommandFailed({ command: options.command, exitCode }))
  }
})

export const requireTool = Effect.fn("requireTool")(function* (command: string) {
  yield* runCommand({
    args: ["--version"],
    command,
    stderr: "ignore",
    stdout: "ignore",
  })
})
