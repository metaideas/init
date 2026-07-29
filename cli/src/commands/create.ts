import * as Effect from "effect/Effect"
import * as Option from "effect/Option"
import * as Argument from "effect/unstable/cli/Argument"
import * as Command from "effect/unstable/cli/Command"
import * as Flag from "effect/unstable/cli/Flag"
import { OperationCancelled } from "#lib/core/errors.ts"
import { selectProjectDestination } from "#lib/projects/destination.ts"
import { runCommand } from "#lib/services/command-runner.ts"
import { Prompter } from "#lib/services/prompter.ts"
import { TemplateDownloader } from "#lib/services/template-downloader.ts"
import { printTitle } from "#lib/shared/terminal.ts"
import { getPackageVersion } from "#lib/shared/version.macro.ts" with { type: "macro" }
import { getCompatibilityWarning, getSnapshotVersion } from "#lib/templates/compatibility.ts"
import { resolveTemplateRef } from "#lib/templates/releases.ts"

const name = Argument.string("name").pipe(
  Argument.optional,
  Argument.withDescription("The name of the project.")
)
const ref = Flag.string("ref").pipe(
  Flag.optional,
  Flag.withDescription("Template tag or branch to scaffold.")
)
const yes = Flag.boolean("yes").pipe(
  Flag.withDefault(false),
  Flag.withDescription("Accept confirmation defaults.")
)
const install = Flag.boolean("install").pipe(
  Flag.withDefault(true),
  Flag.withDescription("Install dependencies after download.")
)

export default Command.make("init-now", { install, name, ref, yes }).pipe(
  Command.withDescription("Create a new project using the `init` template."),
  Command.withHandler(({ install: shouldInstall, name: providedName, ref, yes }) =>
    Effect.gen(function* () {
      const prompter = yield* Prompter
      const downloader = yield* TemplateDownloader

      yield* printTitle()
      yield* prompter.intro("▶︎ init")

      const destination = yield* selectProjectDestination({
        name: Option.getOrUndefined(providedName),
        yes,
      })
      if (yes && destination.force) {
        yield* prompter.log.error(
          `Directory "${destination.directory}" already exists. Remove it or choose a different name.`
        )
        return yield* Effect.fail(new OperationCancelled())
      }

      const templateRef = yield* resolveTemplateRef(Option.getOrUndefined(ref))
      yield* downloader.download({
        directory: destination.directory,
        force: destination.force,
        source: `github:metaideas/init#${templateRef}`,
      })
      const templateVersion = yield* getSnapshotVersion(destination.directory)
      if (templateVersion) {
        const compatibilityWarning = getCompatibilityWarning(getPackageVersion(), templateVersion)
        if (compatibilityWarning) yield* prompter.log.warning(compatibilityWarning)
      }

      yield* prompter.log.success(
        `Created "${destination.directory}" using ▶︎ init (${templateRef}).`
      )

      const installDependencies =
        shouldInstall &&
        (yes ||
          (yield* prompter.confirm({
            initialValue: true,
            message: "Do you want to install dependencies?",
          })))
      if (installDependencies) {
        yield* runCommand({
          args: ["install"],
          command: "bun",
          cwd: destination.directory,
          stderr: "inherit",
          stdout: "inherit",
        })
      } else {
        yield* prompter.log.info(
          `Remember to run \`cd ${destination.directory} && bun install\` to install dependencies.`
        )
      }

      yield* prompter.log.info(
        `Then run \`cd ${destination.directory} && init-now setup\` to initialize your project.`
      )
      yield* prompter.outro("🚀 Build something great!")
    })
  )
)
