import type * as PlatformError from "effect/PlatformError"
import type * as ChildProcessSpawner from "effect/unstable/process/ChildProcessSpawner"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Stream from "effect/Stream"
import * as ChildProcess from "effect/unstable/process/ChildProcess"
import { CliNotFound, CommandFailed } from "#lib/shared/errors.ts"

export type CommandRunOptions = {
  readonly args: readonly string[]
  readonly command: string
  readonly cwd?: string
  readonly stderr?: "ignore" | "inherit"
  readonly stdin?: "ignore" | "inherit"
  readonly stdout?: "ignore" | "inherit"
}

type CommandRunnerError = CliNotFound | PlatformError.PlatformError

function mapCommandError(command: string, cause: PlatformError.PlatformError): CommandRunnerError {
  return cause.reason._tag === "NotFound" ? new CliNotFound({ command }) : cause
}

export class CommandRunner extends Context.Service<
  CommandRunner,
  {
    readonly run: (
      options: CommandRunOptions
    ) => Effect.Effect<
      ChildProcessSpawner.ExitCode,
      CommandRunnerError,
      ChildProcessSpawner.ChildProcessSpawner
    >
    readonly string: (
      options: Omit<CommandRunOptions, "stdout">
    ) => Effect.Effect<
      string,
      CommandFailed | CommandRunnerError,
      ChildProcessSpawner.ChildProcessSpawner
    >
  }
>()("CommandRunner") {
  static readonly layer = Layer.succeed(this)({
    run: ({ args, command, cwd, stderr = "inherit", stdin = "ignore", stdout = "inherit" }) =>
      Effect.mapError(
        Effect.scoped(
          Effect.gen(function* () {
            const handle = yield* ChildProcess.make(command, args, {
              cwd,
              stderr,
              stdin,
              stdout,
            })
            return yield* handle.exitCode
          })
        ),
        (cause) => mapCommandError(command, cause)
      ),
    string: ({ args, command, cwd, stderr = "ignore", stdin = "ignore" }) =>
      Effect.scoped(
        Effect.gen(function* () {
          const handle = yield* ChildProcess.make(command, args, {
            cwd,
            stderr,
            stdin,
            stdout: "pipe",
          })
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
  })
}

export const runCommand = Effect.fn("runCommand")(function* (options: CommandRunOptions) {
  const runner = yield* CommandRunner
  const exitCode = yield* runner.run(options)
  if (Number(exitCode) !== 0) {
    return yield* Effect.fail(new CommandFailed({ command: options.command, exitCode }))
  }
})

export const getCommandOutput = Effect.fn("getCommandOutput")(function* (
  options: Omit<CommandRunOptions, "stdout">
) {
  const runner = yield* CommandRunner
  return yield* runner.string(options)
})

export const requireTool = Effect.fn("requireTool")(function* (command: string) {
  yield* runCommand({
    args: ["--version"],
    command,
    stderr: "ignore",
    stdout: "ignore",
  })
})
