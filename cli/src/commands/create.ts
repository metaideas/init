import * as Effect from "effect/Effect"
import * as FileSystem from "effect/FileSystem"
import * as Option from "effect/Option"
import * as Argument from "effect/unstable/cli/Argument"
import * as Command from "effect/unstable/cli/Command"
import { runCommand } from "#lib/services/command-runner.ts"
import { Prompter } from "#lib/services/prompter.ts"
import { TemplateDownloader } from "#lib/services/template-downloader.ts"
import { OperationCancelled } from "#lib/shared/errors.ts"
import { getProjectNameValidationError, normalizeProjectName } from "#lib/shared/project.ts"
import { printTitle } from "#lib/shared/terminal.ts"

const name = Argument.string("name").pipe(
  Argument.optional,
  Argument.withDescription("The name of the project.")
)

export default Command.make("init-now", { name }).pipe(
  Command.withDescription("Create a new project using the `init` template."),
  Command.withHandler(({ name: providedName }) =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem
      const prompter = yield* Prompter
      const downloader = yield* TemplateDownloader

      yield* printTitle()
      yield* prompter.intro("▶︎ init")

      const projectName = normalizeProjectName(
        yield* prompter.text({
          defaultValue: Option.getOrElse(providedName, () => ""),
          message: "What is the name of your project?",
          validate: getProjectNameValidationError,
        })
      )

      const directoryExists = yield* fs.stat(projectName).pipe(
        Effect.map((info) => info.type === "Directory"),
        Effect.catch(() => Effect.succeed(false))
      )

      if (directoryExists) {
        const shouldOverwrite = yield* prompter.confirm({
          initialValue: false,
          message: `Directory "${projectName}" already exists. Do you want to overwrite it?`,
        })
        if (!shouldOverwrite) return yield* Effect.fail(new OperationCancelled())
      }

      yield* downloader.download({
        directory: projectName,
        force: directoryExists,
        source: "github:metaideas/init",
      })

      yield* prompter.log.success(`Created "${projectName}" using ▶︎ init.`)

      if (
        yield* prompter.confirm({
          initialValue: true,
          message: "Do you want to install dependencies?",
        })
      ) {
        yield* runCommand({
          args: ["install"],
          command: "bun",
          cwd: projectName,
          stderr: "inherit",
          stdout: "inherit",
        })
      } else {
        yield* prompter.log.info(
          `Remember to run \`cd ${projectName} && bun install\` to install dependencies.`
        )
      }

      yield* prompter.log.info(
        `Then run \`cd ${projectName} && init-now setup\` to initialize your project.`
      )
      yield* prompter.outro("🚀 Build something great!")
    })
  )
)
