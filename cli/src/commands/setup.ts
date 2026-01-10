import process from "node:process"
import { Command, Prompt } from "@effect/cli"
import { Command as ShellCommand, FileSystem } from "@effect/platform"
import { workingDirectory } from "@effect/platform/Command"
import { Console, Effect, Option } from "effect"
import { GitInitFailed, InstallFailed, OperationCancelled, requireInitProject } from "#utils.ts"
import { workspaces } from "#workspaces.ts"

const EXCLUDED_DIRS = [
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "out",
  ".turbo",
  ".cache",
  ".pnpm-store",
  ".yarn",
  "scripts/template",
] as const

const README_CONTENT = `
<div align="center">
  <h1 align="center"><code><project-name></code></h1>
</div>

Made with [▶︎ \`init\`](https://github.com/metaideas/init)
    `

const EXCLUDED_FILES = [".DS_Store"] as const
const PATH_NORMALIZE_REGEX = /^\.\//
const PATH_SEP_NORMALIZE_REGEX = /\\/g

function checkShouldExclude(filePath: string): boolean {
  const normalizedPath = filePath
    .replace(PATH_NORMALIZE_REGEX, "")
    .replace(PATH_SEP_NORMALIZE_REGEX, "/")

  const containsExcludedDir = EXCLUDED_DIRS.some(
    (dir) =>
      normalizedPath.includes(`/${dir}/`) ||
      normalizedPath.endsWith(`/${dir}`) ||
      normalizedPath.startsWith(`${dir}/`)
  )

  if (containsExcludedDir) {
    return true
  }

  const endsWithExcludedFile = EXCLUDED_FILES.some(
    (file) => normalizedPath.endsWith(`/${file}`) || normalizedPath === file
  )

  return endsWithExcludedFile
}

const TEXT_FILE_EXTENSIONS = [
  ".astro",
  ".css",
  ".env",
  ".example",
  ".hbs",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mdc",
  ".mdx",
  ".scss",
  ".toml",
  ".ts",
  ".tsx",
  ".txt",
  ".yaml",
  ".yml",
] as const

function isTextFile(file: string): boolean {
  return (
    TEXT_FILE_EXTENSIONS.some((ext) => file.endsWith(ext)) ||
    file.includes("package.json") ||
    file.includes("tsconfig") ||
    file.includes("README")
  )
}

function removeUnselectedWorkspaces(apps: string[], packages: string[]) {
  return Effect.gen(function* () {
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
}

function updatePackageJson(projectName: string) {
  return Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const content = yield* fs.readFileString("package.json")
    const packageJson = JSON.parse(content) as Record<string, unknown>
    packageJson.name = projectName
    packageJson.version = "0.0.1"
    yield* fs.writeFileString("package.json", `${JSON.stringify(packageJson, null, 2)}\n`)
  })
}

function setupEnvironmentVariables(paths: string[]) {
  return Effect.gen(function* () {
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
}

function setupGit() {
  return Effect.gen(function* () {
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
}

function cleanupInternalFiles() {
  return Effect.gen(function* () {
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
}

function getAllFiles() {
  return Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    return yield* fs.readDirectory(".", { recursive: true }).pipe(
      Effect.map((files) => files.filter((file) => !checkShouldExclude(file))),
      Effect.orElseSucceed(() => [])
    )
  })
}

function replaceProjectNameInProjectFiles(projectName: string, currentProjectName?: string) {
  return Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const allFiles = yield* getAllFiles()
    const textFiles = allFiles.filter(isTextFile)

    yield* Effect.forEach(
      textFiles,
      (file) =>
        Effect.gen(function* () {
          const content = yield* fs.readFileString(file)
          let replaced = content.replaceAll("@init", `@${projectName}`)

          if (currentProjectName && currentProjectName !== "init") {
            replaced = replaced.replaceAll(`@${currentProjectName}`, `@${projectName}`)
          }

          if (content !== replaced) {
            yield* fs.writeFileString(file, replaced)
          }
        }).pipe(Effect.orElse(() => Effect.void)),
      { concurrency: 10, discard: true }
    )
  })
}

export default Command.make("setup").pipe(
  Command.withDescription("Setup an `init` project."),
  Command.withHandler(() =>
    Effect.gen(function* () {
      yield* Console.log("\n🔧 Project Setup\n")

      const currentDirName = yield* Effect.sync(() => {
        const cwd = process.cwd()
        return cwd.split("/").pop() || "init"
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
    })
  ),
  Command.provideEffectDiscard(requireInitProject())
)
