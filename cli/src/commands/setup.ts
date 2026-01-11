import { basename } from "node:path"
import process from "node:process"
import { Command, Prompt } from "@effect/cli"
import { Command as ShellCommand, FileSystem } from "@effect/platform"
import { Console, Effect } from "effect"
import {
  GitInitFailed,
  InstallFailed,
  readPackageJson,
  replaceProjectNameInProjectFiles,
  requireInitProject,
} from "#utils.ts"
import { workspaces } from "#workspaces.ts"

const README_CONTENT = `
<div align="center">
  <h1 align="center"><code><project-name></code></h1>
</div>

Made with [▶︎ \`init\`](https://github.com/metaideas/init)
    `

const removeUnselectedWorkspaces = (apps: string[], packages: string[]) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem

    const appsToRemove = workspaces.apps
      .filter((app) => !apps.includes(app.name))
      .map((app) => `apps/${app.name}`)
    const packagesToRemove = workspaces.packages
      .filter((pkg) => !packages.includes(pkg.name))
      .map((pkg) => `packages/${pkg.name}`)

    const pathsToRemove = [...appsToRemove, ...packagesToRemove]

    yield* Effect.forEach(
      pathsToRemove,
      (path) => fs.remove(path, { recursive: true }).pipe(Effect.orElse(() => Effect.void)),
      { concurrency: 10, discard: true }
    )
  })

const updatePackageJson = (projectName: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const packageJson = yield* readPackageJson()
    const updatePackageJson = {
      ...packageJson,
      name: projectName,
      version: "0.0.1",
    }
    yield* fs.writeFileString("package.json", `${JSON.stringify(updatePackageJson, null, 2)}\n`)
  })

const setupEnvironmentVariables = (paths: string[]) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    yield* Effect.forEach(
      paths,
      (workspacePath) =>
        Effect.gen(function* () {
          const templatePath = `${workspacePath}/.env.template`
          const localPath = `${workspacePath}/.env.local`

          const localExists = yield* fs.exists(localPath)
          if (localExists) {
            return
          }

          const templateExists = yield* fs.exists(templatePath)
          if (!templateExists) {
            return
          }

          const templateContent = yield* fs.readFileString(templatePath)
          yield* fs.writeFileString(localPath, templateContent)
        }).pipe(Effect.orElse(() => Effect.void)),
      { concurrency: 10, discard: true }
    )
  })

const setupGit = () =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const gitExists = yield* fs.exists(".git")
    if (gitExists) {
      return
    }

    yield* ShellCommand.make("git", "init").pipe(
      ShellCommand.exitCode,
      Effect.mapError((e) => new GitInitFailed({ cause: e }))
    )
  })

const cleanupInternalFiles = () =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const filesToRemove = [
      "release-please-config.json",
      ".github/workflows/release.yml",
      "__tests__",
      "cli",
    ]

    yield* Effect.forEach(
      filesToRemove,
      (file) => fs.remove(file, { recursive: true }).pipe(Effect.orElse(() => Effect.void)),
      { concurrency: 10, discard: true }
    )
  })

export default Command.make("setup").pipe(
  Command.withDescription("Setup an `init` project."),
  Command.withHandler(() =>
    Effect.gen(function* () {
      yield* Console.log("\n🔧 Project Setup\n")

      const currentDirName = yield* Effect.sync(() => {
        const cwd = process.cwd()
        return basename(cwd) || "init"
      })

      const projectName = yield* Prompt.text({
        message: "Enter your project name (for @[project-name] monorepo alias):",
        default: currentDirName,
        validate: (value: string) => {
          const trimmed = value.trim()

          if (!trimmed) {
            return Effect.fail("Project name is required.")
          }

          return Effect.succeed(trimmed)
        },
      })

      const apps = yield* Prompt.multiSelect({
        message: "Select apps to keep (all others will be removed)",
        choices: workspaces.apps.map((app) => ({
          title: app.name,
          value: app.name,
          description: app.description,
        })),
      })

      const requiredPackages = new Set<string>()

      for (const app of apps) {
        const foundApp = workspaces.apps.find((a) => a.name === app)
        if (foundApp?.dependencies) {
          for (const dep of foundApp.dependencies) {
            requiredPackages.add(dep)
          }
        }
      }

      const selectedPackages = yield* Prompt.multiSelect({
        message:
          "Select packages to keep (all others will be removed). We've automatically selected packages that are required by the selected apps.",
        choices: workspaces.packages.map((pkg) => ({
          title: pkg.name,
          value: pkg.name,
          description: pkg.description,
          selected: requiredPackages.has(pkg.name),
        })),
      })

      const packages = selectedPackages

      yield* Console.log("   Removing unselected workspaces...\n")
      yield* removeUnselectedWorkspaces(apps, packages)
      yield* Console.log("✅ Workspaces removed\n")

      if (projectName !== "init") {
        yield* Console.log("   Updating package.json...\n")
        yield* updatePackageJson(projectName)
        yield* Console.log("✅ Package.json updated\n")

        yield* Console.log("   Updating file references...\n")
        yield* replaceProjectNameInProjectFiles(projectName)
        yield* Console.log("✅ References updated\n")
      }

      yield* Console.log("   Setting up environment files...\n")
      yield* setupEnvironmentVariables([
        ...apps.map((app) => `apps/${app}`),
        ...packages.map((pkg) => `packages/${pkg}`),
      ])
      yield* Console.log("✅ Environment files setup complete\n")

      yield* Console.log("   Initializing Git repository...\n")
      yield* setupGit()
      yield* Console.log("✅ Git repository initialized\n")

      yield* Console.log("   Cleaning up internal files...\n")
      yield* cleanupInternalFiles()
      yield* Console.log("✅ Internal files removed\n")

      yield* Console.log("   Creating README...\n")
      const fs = yield* FileSystem.FileSystem
      yield* fs.writeFileString("README.md", README_CONTENT.replace("<project-name>", projectName))
      yield* Console.log("✅ README created\n")

      yield* Console.log("   Installing dependencies...\n")
      yield* ShellCommand.make("bun", "install").pipe(
        ShellCommand.stdout("inherit"),
        ShellCommand.stderr("inherit"),
        ShellCommand.exitCode,
        Effect.mapError((e) => new InstallFailed({ cause: e }))
      )
      yield* Console.log("✅ Dependencies installed\n")

      yield* Console.log("\n🎉 All setup steps complete! Your project is ready.\n")
    }).pipe(
      Effect.catchTags({
        GitInitFailed: (e) =>
          Console.error(`\nAn error occurred while initializing git: ${e.message}`),
        InstallFailed: (e) =>
          Console.error(`\nAn error occurred while installing dependencies: ${e.message}`),
      })
    )
  ),
  Command.provideEffectDiscard(requireInitProject())
)
