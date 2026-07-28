import * as NodeRuntime from "@effect/platform-node/NodeRuntime"
import * as NodeServices from "@effect/platform-node/NodeServices"
import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
import * as Layer from "effect/Layer"
import * as Runtime from "effect/Runtime"
import * as Command from "effect/unstable/cli/Command"
import * as ChildProcessSpawner from "effect/unstable/process/ChildProcessSpawner"
import addCommand from "#commands/add.ts"
import checkCommand from "#commands/check.ts"
import createCommand from "#commands/create.ts"
import renameCommand from "#commands/rename.ts"
import setupCommand from "#commands/setup.ts"
import updateCommand from "#commands/update.ts"
import { CommandRunner } from "#lib/services/command-runner.ts"
import { Prompter } from "#lib/services/prompter.ts"
import { ReleaseClient } from "#lib/services/release-client.ts"
import { TemplateDownloader } from "#lib/services/template-downloader.ts"
import { getPackageVersion } from "#lib/shared/version.macro.ts" with { type: "macro" }

const main = createCommand.pipe(
  Command.withSubcommands([setupCommand, addCommand, checkCommand, renameCommand, updateCommand])
)

const version = getPackageVersion()

const program = Command.run(main, { version }).pipe(
  Effect.as(ChildProcessSpawner.ExitCode(0)),
  Effect.catchTag("OperationCancelled", () =>
    Effect.gen(function* () {
      const prompter = yield* Prompter
      yield* prompter.cancel("Operation cancelled.")
      return ChildProcessSpawner.ExitCode(0)
    })
  ),
  Effect.catchTag("CommandFailed", (error) =>
    Effect.gen(function* () {
      const prompter = yield* Prompter
      yield* prompter.log.error(error.message)
      return error.exitCode
    })
  ),
  Effect.catch((error) =>
    Effect.gen(function* () {
      const prompter = yield* Prompter
      yield* prompter.log.error(error instanceof Error ? error.message : String(error))
      return ChildProcessSpawner.ExitCode(1)
    })
  ),
  Effect.provide(
    Layer.mergeAll(
      NodeServices.layer,
      Prompter.layer,
      CommandRunner.layer,
      ReleaseClient.layer,
      TemplateDownloader.layer
    )
  )
)

NodeRuntime.runMain(program, {
  teardown: (exit, onExit) => {
    if (Exit.isSuccess(exit)) {
      onExit(Number(exit.value))
      return
    }
    Runtime.defaultTeardown(exit, onExit)
  },
})
