import * as Effect from "effect/Effect"
import * as Option from "effect/Option"
import * as Command from "effect/unstable/cli/Command"
import * as Flag from "effect/unstable/cli/Flag"
import { readPackageJson, replaceProjectNameInProjectFiles } from "#lib/projects/files.ts"
import { requireTool, runCommand } from "#lib/services/command-runner.ts"
import { Prompter } from "#lib/services/prompter.ts"
import { getPackageVersion } from "#lib/shared/version.macro.ts" with { type: "macro" }
import { acquireWorkspaceTemplate } from "#lib/templates/acquisition.ts"
import { getCompatibilityWarning } from "#lib/templates/compatibility.ts"
import { getVersion, requireInitProject } from "#lib/templates/versions.ts"
import {
  confirmWorkspaceAddition,
  selectWorkspaceAddition,
  writeWorkspaceAddition,
} from "#lib/workspaces/addition.ts"

const workspace = Flag.string("workspace").pipe(
  Flag.optional,
  Flag.withDescription("Workspace id from the init template.")
)
const destination = Flag.string("destination").pipe(
  Flag.optional,
  Flag.withDescription("Destination directory name.")
)
const yes = Flag.boolean("yes").pipe(Flag.withDefault(false))
const install = Flag.boolean("install").pipe(Flag.withDefault(true))

const appCommand = Command.make("app", {
  destination,
  install,
  workspace,
  yes,
}).pipe(
  Command.withDescription("Add an app from the init template to your monorepo"),
  Command.withHandler((flags) =>
    Effect.gen(function* () {
      yield* requireInitProject()
      if (flags.install) yield* requireTool("bun")

      const prompter = yield* Prompter
      const projectPackageJson = yield* readPackageJson()
      const version = yield* getVersion()

      if (version) {
        const compatibilityWarning = getCompatibilityWarning(getPackageVersion(), version)
        if (compatibilityWarning) yield* prompter.log.warning(compatibilityWarning)
      } else {
        yield* prompter.log.warning(
          "This project has no recorded template version; adding from main."
        )
      }

      yield* prompter.intro("📦 Add an `init` app")
      const template = yield* acquireWorkspaceTemplate(version)
      const plan = yield* selectWorkspaceAddition(template.manifest, {
        type: "app",
        workspace: Option.getOrUndefined(flags.workspace),
      })
      const appName = yield* confirmWorkspaceAddition(plan, {
        destination: Option.getOrUndefined(flags.destination),
        yes: flags.yes,
      })
      const copiedDirectories = yield* writeWorkspaceAddition({
        destinationName: appName,
        plan,
        projectName: projectPackageJson.name,
        templateDirectory: template.directory,
      })

      yield* replaceProjectNameInProjectFiles(
        projectPackageJson.name,
        undefined,
        copiedDirectories,
        template.manifest.excludedPaths
      )

      if (flags.install) {
        yield* runCommand({
          args: ["install"],
          command: "bun",
          stderr: "inherit",
          stdout: "inherit",
        })
      }

      yield* prompter.outro(
        `🎉 Added app ${copiedDirectories.map((directory) => `\`${directory}\``).join(", ")}`
      )
    }).pipe(Effect.scoped)
  )
)

const packageCommand = Command.make("package", {
  destination,
  install,
  workspace,
  yes,
}).pipe(
  Command.withDescription("Add a package from the init template to your monorepo"),
  Command.withHandler((flags) =>
    Effect.gen(function* () {
      yield* requireInitProject()
      if (flags.install) yield* requireTool("bun")

      const prompter = yield* Prompter
      const projectPackageJson = yield* readPackageJson()
      const version = yield* getVersion()

      if (version) {
        const compatibilityWarning = getCompatibilityWarning(getPackageVersion(), version)
        if (compatibilityWarning) yield* prompter.log.warning(compatibilityWarning)
      } else {
        yield* prompter.log.warning(
          "This project has no recorded template version; adding from main."
        )
      }

      yield* prompter.intro("📦 Add an `init` package")
      const template = yield* acquireWorkspaceTemplate(version)
      const plan = yield* selectWorkspaceAddition(template.manifest, {
        type: "package",
        workspace: Option.getOrUndefined(flags.workspace),
      })
      const packageName = yield* confirmWorkspaceAddition(plan, {
        destination: Option.getOrUndefined(flags.destination),
        yes: flags.yes,
      })
      const copiedDirectories = yield* writeWorkspaceAddition({
        destinationName: packageName,
        plan,
        projectName: projectPackageJson.name,
        templateDirectory: template.directory,
      })

      yield* replaceProjectNameInProjectFiles(
        projectPackageJson.name,
        undefined,
        copiedDirectories,
        template.manifest.excludedPaths
      )

      if (flags.install) {
        yield* runCommand({
          args: ["install"],
          command: "bun",
          stderr: "inherit",
          stdout: "inherit",
        })
      }

      yield* prompter.outro(
        `🎉 Added package ${copiedDirectories.map((directory) => `\`${directory}\``).join(", ")}`
      )
    }).pipe(Effect.scoped)
  )
)

export default Command.make("add").pipe(
  Command.withDescription("Add workspaces to your monorepo"),
  Command.withSubcommands([appCommand, packageCommand])
)
