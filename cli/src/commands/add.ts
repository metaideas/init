import { Command, Prompt } from "@effect/cli"
import { Command as ShellCommand, FileSystem } from "@effect/platform"
import { Console, Effect } from "effect"
import { readPackageJson, requireInitProject, TurboGenFailed } from "#utils.ts"
import { workspaces } from "#workspaces.ts"

const appCommand = Command.make("app").pipe(
  Command.withDescription("Add an app from the init template to your monorepo"),
  Command.withHandler(() =>
    Effect.gen(function* () {
      yield* Console.log("\n📦 Add an `init` app\n")

      const selectedWorkspace = yield* Prompt.select({
        message: "Select an app from the init template",
        choices: workspaces.apps.map((app) => ({
          title: app.name,
          value: app.name,
          description: app.description,
        })),
      })

      const workspaceName = yield* Prompt.text({
        message: "Name your app",
        default: selectedWorkspace,
      })

      yield* ShellCommand.make(
        "turbo",
        "gen",
        "workspace",
        "--copy",
        `https://github.com/metaideas/init/tree/main/apps/${selectedWorkspace}`,
        "--type",
        "app",
        "--name",
        workspaceName,
        "--no-update-notifier"
      ).pipe(
        ShellCommand.feed("n\n"),
        ShellCommand.stdout("inherit"),
        ShellCommand.stderr("inherit"),
        ShellCommand.exitCode,
        Effect.mapError((e) => new TurboGenFailed({ cause: e }))
      )

      yield* Console.log("\n🎉 App generated successfully!\n")
    })
  ),
  Command.provideEffectDiscard(requireInitProject())
)

const packageCommand = Command.make("package").pipe(
  Command.withDescription("Add a package from the init template to your monorepo"),
  Command.withHandler(() =>
    Effect.gen(function* () {
      yield* Console.log("\n📦 Add an `init` package\n")

      const selectedWorkspace = yield* Prompt.select({
        message: "Select a package from the init template",
        choices: workspaces.packages.map((pkg) => ({
          title: pkg.name,
          value: pkg.name,
          description: pkg.description,
        })),
      })

      const packageJson = yield* readPackageJson().pipe(
        Effect.catchAll(() => Effect.succeed({ name: "init" }))
      )

      const projectName = packageJson.name

      const packageName = yield* Prompt.text({
        message: "Name your package",
        default: selectedWorkspace,
      })

      const name = `@${projectName}/${packageName}`

      yield* ShellCommand.make(
        "turbo",
        "gen",
        "workspace",
        "--copy",
        `https://github.com/metaideas/init/tree/main/packages/${selectedWorkspace}`,
        "--type",
        "package",
        "--name",
        name,
        "--destination",
        `packages/${packageName}`,
        "--no-update-notifier"
      ).pipe(
        ShellCommand.feed("n\n"),
        ShellCommand.stdout("inherit"),
        ShellCommand.stderr("inherit"),
        ShellCommand.exitCode,
        Effect.mapError((e) => new TurboGenFailed({ cause: e }))
      )

      yield* Console.log("\n🎉 Package generated successfully!\n")
    })
  ),
  Command.provideEffectDiscard(requireInitProject())
)

export default Command.make("add").pipe(
  Command.withDescription("Add workspaces to your monorepo"),
  Command.withSubcommands([appCommand, packageCommand])
)
