import { basename } from "node:path"
import process from "node:process"
import * as Effect from "effect/Effect"
import * as FileSystem from "effect/FileSystem"
import * as Command from "effect/unstable/cli/Command"
import { requireTool, runCommand } from "#lib/services/command-runner.ts"
import { Prompter } from "#lib/services/prompter.ts"
import { internalPaths } from "#lib/shared/internal-paths.ts"
import {
  getProjectNameValidationError,
  normalizeProjectName,
  replaceProjectNameInProjectFiles,
  updatePackageJson,
} from "#lib/shared/project.ts"
import { requireInitProject } from "#lib/shared/releases.ts"
import { workspaces } from "#lib/shared/workspaces.ts"

const README_CONTENT = `
<div align="center">
  <h1 align="center"><code><project-name></code></h1>
</div>

Made with [▶︎ \`init\`](https://github.com/metaideas/init)
    `

const removeUnselectedWorkspaces = Effect.fn("removeUnselectedWorkspaces")(function* (
  apps: string[],
  packages: string[]
) {
  const fs = yield* FileSystem.FileSystem
  const pathsToRemove = [
    ...workspaces.apps.filter((app) => !apps.includes(app.name)).map((app) => `apps/${app.name}`),
    ...workspaces.packages
      .filter((pkg) => !packages.includes(pkg.name))
      .map((pkg) => `packages/${pkg.name}`),
  ]

  yield* Effect.forEach(
    pathsToRemove,
    (path) => fs.remove(path, { force: true, recursive: true }),
    { concurrency: 10, discard: true }
  )
})

const setupEnvironmentVariables = Effect.fn("setupEnvironmentVariables")(function* (
  paths: string[]
) {
  const fs = yield* FileSystem.FileSystem
  yield* Effect.forEach(
    paths,
    (workspacePath) =>
      Effect.gen(function* () {
        const templatePath = `${workspacePath}/.env.template`
        const localPath = `${workspacePath}/.env.local`
        if ((yield* fs.exists(localPath)) || !(yield* fs.exists(templatePath))) return
        yield* fs.writeFileString(localPath, yield* fs.readFileString(templatePath))
      }),
    { concurrency: 10, discard: true }
  )
})

const setupGit = Effect.fn("setupGit")(function* () {
  const fs = yield* FileSystem.FileSystem
  if (yield* fs.exists(".git")) return
  yield* runCommand({ args: ["init"], command: "git" })
})

export const cleanupInternalFiles = Effect.fn("cleanupInternalFiles")(function* () {
  const fs = yield* FileSystem.FileSystem
  yield* Effect.forEach(
    internalPaths,
    (path) => fs.remove(path, { force: true, recursive: true }),
    { concurrency: 10, discard: true }
  )
})

export default Command.make("setup").pipe(
  Command.withDescription("Setup an `init` project."),
  Command.withHandler(() =>
    Effect.gen(function* () {
      yield* requireInitProject()
      yield* requireTool("git")
      const prompter = yield* Prompter

      yield* prompter.intro("🔧 Project Setup")
      const currentDirName = basename(process.cwd()) || "init"
      const projectName = normalizeProjectName(
        yield* prompter.text({
          defaultValue: currentDirName,
          message: "Enter your project name (for @[project-name] monorepo alias):",
          validate: getProjectNameValidationError,
        })
      )
      const apps = yield* prompter.multiselect({
        message: "Select apps to keep (all others will be removed)",
        options: workspaces.apps.map((app) => ({
          hint: app.description,
          label: app.name,
          value: app.name,
        })),
        required: false,
      })

      const requiredPackages = new Set(
        apps.flatMap(
          (app) => workspaces.apps.find((candidate) => candidate.name === app)?.dependencies ?? []
        )
      )
      const selectedPackages = yield* prompter.multiselect({
        initialValues: [...requiredPackages],
        message:
          "Select packages to keep (all others will be removed). We've automatically selected packages that are required by the selected apps.",
        options: workspaces.packages.map((pkg) => ({
          hint: pkg.description,
          label: pkg.name,
          value: pkg.name,
        })),
        required: false,
      })

      yield* prompter.log.info("Removing unselected workspaces...")
      yield* removeUnselectedWorkspaces(apps, selectedPackages)
      yield* prompter.log.success("Workspaces removed")

      if (projectName !== "init") {
        yield* prompter.log.info("Updating package.json...")
        yield* updatePackageJson(projectName, "0.0.1")
        yield* prompter.log.success("Package.json updated")
        yield* prompter.log.info("Updating file references...")
        yield* replaceProjectNameInProjectFiles(projectName)
        yield* prompter.log.success("References updated")
      }

      yield* prompter.log.info("Setting up environment files...")
      yield* setupEnvironmentVariables([
        ...apps.map((app) => `apps/${app}`),
        ...selectedPackages.map((pkg) => `packages/${pkg}`),
      ])
      yield* prompter.log.success("Environment files setup complete")

      yield* prompter.log.info("Initializing Git repository...")
      yield* setupGit()
      yield* prompter.log.success("Git repository initialized")

      yield* prompter.log.info("Cleaning up internal files...")
      yield* cleanupInternalFiles()
      yield* prompter.log.success("Internal files removed")

      yield* prompter.log.info("Creating README...")
      const fs = yield* FileSystem.FileSystem
      yield* fs.writeFileString("README.md", README_CONTENT.replace("<project-name>", projectName))
      yield* prompter.log.success("README created")

      yield* prompter.log.info("Installing dependencies...")
      yield* runCommand({
        args: ["install"],
        command: "bun",
        stderr: "inherit",
        stdout: "inherit",
      })
      yield* prompter.log.success("Dependencies installed")
      yield* prompter.outro("🎉 All setup steps complete! Your project is ready.")
    })
  )
)
