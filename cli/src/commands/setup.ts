import * as Effect from "effect/Effect"
import * as Option from "effect/Option"
import * as Command from "effect/unstable/cli/Command"
import * as Flag from "effect/unstable/cli/Flag"
import { configureProject, initializeGitRepository } from "#lib/projects/configuration.ts"
import { requireTool, runCommand } from "#lib/services/command-runner.ts"
import { Prompter } from "#lib/services/prompter.ts"
import { getPackageVersion } from "#lib/shared/version.macro.ts" with { type: "macro" }
import { getCompatibilityWarning } from "#lib/templates/compatibility.ts"
import { readManifest } from "#lib/templates/manifest.ts"
import { getVersion, requireInitProject } from "#lib/templates/versions.ts"
import {
  selectWorkspaceConfiguration,
  validateWorkspaceFlags,
} from "#lib/workspaces/configuration.ts"
import { pruneWorkspaces } from "#lib/workspaces/pruning.ts"

const name = Flag.string("name").pipe(
  Flag.optional,
  Flag.withDescription("Project name and monorepo scope.")
)
const apps = Flag.string("apps").pipe(
  Flag.optional,
  Flag.withDescription("Comma-separated app ids to keep.")
)
const packages = Flag.string("packages").pipe(
  Flag.optional,
  Flag.withDescription("Comma-separated package ids to keep.")
)
const yes = Flag.boolean("yes").pipe(
  Flag.withDefault(false),
  Flag.withDescription("Accept defaults and recommendation warnings.")
)
const install = Flag.boolean("install").pipe(
  Flag.withDefault(true),
  Flag.withDescription("Install dependencies after setup.")
)
const git = Flag.boolean("git").pipe(
  Flag.withDefault(true),
  Flag.withDescription("Initialize a Git repository.")
)

export default Command.make("setup", { apps, git, install, name, packages, yes }).pipe(
  Command.withDescription("Setup an `init` project."),
  Command.withHandler((flags) =>
    Effect.gen(function* () {
      yield* requireInitProject()
      const templateVersion = yield* getVersion()
      const manifest = yield* readManifest()
      const prompter = yield* Prompter

      if (templateVersion) {
        const compatibilityWarning = getCompatibilityWarning(getPackageVersion(), templateVersion)
        if (compatibilityWarning) {
          yield* prompter.log.warning(compatibilityWarning)
        }
      }

      const workspaceFlags = yield* validateWorkspaceFlags(manifest, {
        apps: Option.getOrUndefined(flags.apps),
        packages: Option.getOrUndefined(flags.packages),
      })
      const defaultWorkspaceFlags =
        flags.yes && workspaceFlags.apps === undefined && workspaceFlags.packages === undefined
          ? {
              apps: manifest.workspaces
                .filter((workspace) => workspace.type === "app")
                .map((workspace) => workspace.id),
              packages: manifest.workspaces
                .filter((workspace) => workspace.type === "package")
                .map((workspace) => workspace.id),
            }
          : workspaceFlags

      if (flags.git) yield* requireTool("git")
      if (flags.install) yield* requireTool("bun")

      yield* prompter.intro("🔧 Project Setup")
      const configuration = yield* selectWorkspaceConfiguration(manifest, {
        ...defaultWorkspaceFlags,
        name: Option.getOrUndefined(flags.name),
        yes: flags.yes,
      })
      const removedWorkspaces = manifest.workspaces
        .filter(
          (workspace) =>
            (workspace.type === "app" || workspace.type === "package") &&
            !configuration.selected.has(workspace.id)
        )
        .map((workspace) => workspace.id)
      if (flags.yes && removedWorkspaces.length > 0) {
        yield* prompter.log.info(
          `The following workspaces will be removed: ${removedWorkspaces.join(", ")}`
        )
      }
      const selectedWorkspacePaths = yield* pruneWorkspaces(manifest, configuration)
      yield* configureProject({
        manifest,
        projectName: configuration.projectName,
        selectedWorkspacePaths,
        templateVersion,
      })

      if (flags.git) {
        yield* prompter.log.info("Initializing Git repository...")
        yield* initializeGitRepository()
        yield* prompter.log.success("Git repository initialized")
      }

      if (flags.install) {
        yield* prompter.log.info("Installing dependencies...")
        yield* runCommand({
          args: ["install"],
          command: "bun",
          stderr: "inherit",
          stdout: "inherit",
        })
        yield* prompter.log.success("Dependencies installed")
      }

      yield* prompter.outro("🎉 All setup steps complete! Your project is ready.")
    })
  )
)
