import * as Effect from "effect/Effect"
import * as Command from "effect/unstable/cli/Command"
import { requireTool, runCommand } from "#lib/services/command-runner.ts"
import { Prompter } from "#lib/services/prompter.ts"
import { readPackageJson } from "#lib/shared/project.ts"
import { requireInitProject } from "#lib/shared/releases.ts"
import { workspaces } from "#lib/shared/workspaces.ts"

const appCommand = Command.make("app").pipe(
  Command.withDescription("Add an app from the init template to your monorepo"),
  Command.withHandler(() =>
    Effect.gen(function* () {
      yield* requireInitProject()
      yield* requireTool("turbo")
      const prompter = yield* Prompter

      yield* prompter.intro("📦 Add an `init` app")
      const selectedWorkspace = yield* prompter.select({
        message: "Select an app from the init template",
        options: workspaces.apps.map((app) => ({
          hint: app.description,
          label: app.name,
          value: app.name,
        })),
      })
      const workspaceName = yield* prompter.text({
        defaultValue: selectedWorkspace,
        message: "Name your app",
      })

      yield* runCommand({
        args: [
          "gen",
          "workspace",
          "--copy",
          `https://github.com/metaideas/init/tree/main/apps/${selectedWorkspace}`,
          "--type",
          "app",
          "--name",
          workspaceName,
          "--no-update-notifier",
        ],
        command: "turbo",
        stderr: "inherit",
        stdin: "inherit",
        stdout: "inherit",
      })
      yield* prompter.outro("🎉 App generated successfully!")
    })
  )
)

const packageCommand = Command.make("package").pipe(
  Command.withDescription("Add a package from the init template to your monorepo"),
  Command.withHandler(() =>
    Effect.gen(function* () {
      yield* requireInitProject()
      yield* requireTool("turbo")
      const prompter = yield* Prompter

      yield* prompter.intro("📦 Add an `init` package")
      const selectedWorkspace = yield* prompter.select({
        message: "Select a package from the init template",
        options: workspaces.packages.map((pkg) => ({
          hint: pkg.description,
          label: pkg.name,
          value: pkg.name,
        })),
      })
      const packageJson = yield* readPackageJson()
      const packageName = yield* prompter.text({
        defaultValue: selectedWorkspace,
        message: "Name your package",
      })

      yield* runCommand({
        args: [
          "gen",
          "workspace",
          "--copy",
          `https://github.com/metaideas/init/tree/main/packages/${selectedWorkspace}`,
          "--type",
          "package",
          "--name",
          `@${packageJson.name}/${packageName}`,
          "--destination",
          `packages/${packageName}`,
          "--no-update-notifier",
        ],
        command: "turbo",
        stderr: "inherit",
        stdin: "inherit",
        stdout: "inherit",
      })
      yield* prompter.outro("🎉 Package generated successfully!")
    })
  )
)

export default Command.make("add").pipe(
  Command.withDescription("Add workspaces to your monorepo"),
  Command.withSubcommands([appCommand, packageCommand])
)
