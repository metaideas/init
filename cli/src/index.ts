import process from "node:process"
import { Args, Command, Prompt } from "@effect/cli"
import { Command as ShellCommand, FileSystem } from "@effect/platform"
import { BunContext, BunRuntime } from "@effect/platform-bun"
import { Console, Effect, Option } from "effect"
import { downloadTemplate } from "giget"
import addCommand from "#commands/add.ts"
import checkCommand from "#commands/check.ts"
import renameCommand from "#commands/rename.ts"
import setupCommand from "#commands/setup.ts"
import updateCommand from "#commands/update.ts"
import { DownloadFailed, InstallFailed, NotInInitProject, OperationCancelled } from "#utils.ts"

const PROJECT_NAME_REGEX = /^[a-z0-9-_]+$/i

const TITLE = `

            ███              ███   █████
           ░░░              ░░░   ░░███
           ████  ████████   ████  ███████
          ░░███ ░░███░░███ ░░███ ░░░███░
           ░███  ░███ ░███  ░███   ░███
           ░███  ░███ ░███  ░███   ░███ ███
           █████ ████ █████ █████  ░░█████
          ░░░░░ ░░░░ ░░░░░ ░░░░░    ░░░░░

`

const name = Args.text({ name: "name" }).pipe(
  Args.optional,
  Args.withDescription("The name of the project.")
)

const main = Command.make("init-now", { name }).pipe(
  Command.withDescription("Create a new project using the `init` template."),
  Command.withHandler(({ name: providedName }) =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem

      yield* Console.log(TITLE)

      const name = yield* Prompt.text({
        message: "What is the name of your project?",
        default: Option.getOrElse(providedName, () => ""),
        validate: (value: string) => {
          const name = value.trim()
          if (!name || name.length === 0) return Effect.fail("Project name is required.")

          if (!PROJECT_NAME_REGEX.test(name)) {
            return Effect.fail(
              "Project name can only contain letters, numbers, hyphens, and underscores."
            )
          }

          return Effect.succeed(name)
        },
      })

      const directoryExists = yield* fs.stat(name).pipe(
        Effect.map((info) => info.type === "Directory"),
        Effect.orElseSucceed(() => false)
      )

      if (directoryExists) {
        const shouldOverwrite = yield* Prompt.confirm({
          message: `Directory "${name}" already exists. Do you want to overwrite it?`,
          initial: false,
        })

        if (!shouldOverwrite) {
          return yield* Effect.fail(new OperationCancelled())
        }
      }

      yield* Effect.tryPromise({
        try: () => downloadTemplate("github:metaideas/init", { dir: name }),
        catch: (e) => new DownloadFailed({ cause: e }),
      })

      yield* Console.log(`\n✅ Created "${name}" using ▶︎ init.\n`)

      const shouldInstall = yield* Prompt.confirm({
        message: "Do you want to install dependencies?",
        initial: true,
      })

      if (shouldInstall) {
        yield* ShellCommand.make("bun", "install").pipe(
          ShellCommand.workingDirectory(name),
          ShellCommand.stdout("inherit"),
          ShellCommand.stderr("inherit"),
          ShellCommand.exitCode,
          Effect.mapError((e) => new InstallFailed({ cause: e }))
        )
      } else {
        yield* Console.log(
          `\n   Remember to run \`cd ${name} && bun install\` to install dependencies.\n`
        )
      }

      yield* Console.log(
        `   Then run \`cd ${name} && init-now setup\` to initialize your project.\n`
      )

      yield* Console.log("\n🚀 Build something great!\n")
    })
  ),
  Command.withSubcommands([setupCommand, addCommand, checkCommand, renameCommand, updateCommand])
)

const cli = Command.run(main, {
  name: "init-now",
  version: "2.0.0",
})

cli(process.argv).pipe(
  Effect.catchTags({
    QuitException: () => Console.error("\n\nOperation cancelled."),
    OperationCancelled: () => Console.error("\n\nOperation cancelled."),
    DownloadFailed: (e) =>
      Console.error(`\nAn error occurred while downloading the template: ${e.message}`),
    InstallFailed: (e) =>
      Console.error(`\nAn error occurred while installing dependencies: ${e.message}`),
    NotInInitProject: () =>
      Console.error(
        "\n\nThis command must be run inside an init project.\nMake sure a .template-version.json file exists."
      ),
  }),
  Effect.tapErrorCause(Effect.logError),
  Effect.provide(BunContext.layer),
  BunRuntime.runMain
)
