import { dirname, join } from "node:path"
import process from "node:process"
import { Command } from "@effect/cli"
import { Command as ShellCommand, FileSystem } from "@effect/platform"
import { Console, Effect } from "effect"
import {
  compareVersions,
  getLatestRelease,
  getVersion,
  GitCloneFailed,
  requireInitProject,
  updateTemplateVersion,
  WorkingTreeDirty,
} from "#utils.ts"

const TEMP_DIR = ".template-sync-tmp"
const REMOTE_URL = "https://github.com/metaideas/init.git"

const cloneTemplate = () =>
  ShellCommand.make("git", "clone", REMOTE_URL, TEMP_DIR, "--depth", "1", "--quiet").pipe(
    ShellCommand.exitCode,
    Effect.mapError((e) => new GitCloneFailed({ cause: e }))
  )

const getTemplateFiles = () =>
  ShellCommand.make("git", "-C", TEMP_DIR, "ls-files").pipe(
    ShellCommand.string,
    Effect.map((output) => output.split("\n").filter(Boolean))
  )

const getLocalFiles = () =>
  ShellCommand.make("git", "ls-files").pipe(
    ShellCommand.string,
    Effect.map((output) => output.split("\n").filter(Boolean))
  )

const getFileDiff = (localFiles: string[], templateFiles: string[]) =>
  Effect.gen(function* () {
    const fileChecks = yield* Effect.forEach(
      templateFiles,
      (file) =>
        Effect.gen(function* () {
          const isNew = !localFiles.includes(file)
          const hasLocalChanges = isNew
            ? false
            : yield* ShellCommand.make("git", "diff", "--quiet", "HEAD", "--", file).pipe(
                ShellCommand.exitCode,
                Effect.map(() => false),
                Effect.catchAll(() => Effect.succeed(true))
              )

          return { file, hasLocalChanges, isNew }
        }),
      { concurrency: 10 }
    )

    const filesToUpdate: string[] = []
    const newFiles: string[] = []

    for (const { file, isNew, hasLocalChanges } of fileChecks) {
      if (isNew) {
        newFiles.push(file)
      } else if (!hasLocalChanges) {
        filesToUpdate.push(file)
      }
    }

    return { filesToUpdate, newFiles }
  })

const copyFiles = (files: string[]) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    yield* Effect.forEach(
      files,
      (file) =>
        Effect.gen(function* () {
          const source = join(TEMP_DIR, file)
          const dest = join(process.cwd(), file)

          const dir = dirname(dest)
          const dirExists = yield* fs.exists(dir)
          if (!dirExists) {
            yield* fs.makeDirectory(dir, { recursive: true }).pipe(Effect.orElse(() => Effect.void))
          }

          const sourceContent = yield* fs.readFile(source)
          yield* fs.writeFile(dest, sourceContent).pipe(Effect.orElse(() => Effect.void))
        }),
      { concurrency: 10, discard: true }
    )
  })

const getExistingWorkspaceNames = (workspaceRoot: "apps" | "packages") =>
  ShellCommand.make(
    "sh",
    "-c",
    `for dir in ${workspaceRoot}/*/; do [ -d "$dir" ] && basename "$dir"; done`
  ).pipe(
    ShellCommand.string,
    Effect.map((output) => new Set(output.split("\n").filter(Boolean))),
    Effect.catchAll(() => Effect.succeed(new Set()))
  )

const filterNewFilesForExistingWorkspaces = (newFiles: string[]) =>
  Effect.gen(function* () {
    const [existingApps, existingPackages] = yield* Effect.all(
      [getExistingWorkspaceNames("apps"), getExistingWorkspaceNames("packages")],
      { concurrency: 2 }
    )

    return newFiles.filter((filePath) => {
      if (filePath.startsWith("apps/")) {
        const parts = filePath.split("/")
        const appName = parts[1]
        return appName !== undefined && existingApps.has(appName)
      }
      if (filePath.startsWith("packages/")) {
        const parts = filePath.split("/")
        const packageName = parts[1]
        return packageName !== undefined && existingPackages.has(packageName)
      }
      return true
    })
  })

const checkVersionUpdates = () =>
  Effect.gen(function* () {
    const currentVersion = yield* getVersion()
    const latestRelease = yield* getLatestRelease().pipe(
      Effect.catchAll(() => Effect.succeed(null))
    )

    if (latestRelease) {
      const latestVersion = latestRelease.tagName

      if (currentVersion) {
        const comparison = compareVersions(currentVersion, latestVersion)
        if (comparison === 0) {
          return {
            latestRelease,
            message: `Already up to date (${currentVersion})`,
            shouldExit: true,
          }
        }
        if (comparison > 0) {
          return {
            latestRelease,
            shouldExit: false,
            warning: `Local version (${currentVersion}) is newer than latest release (${latestVersion})`,
          }
        }
        const releaseNotes = latestRelease.body ? `\nRelease notes:\n${latestRelease.body}` : ""
        return {
          latestRelease,
          message: `Update available: ${currentVersion} → ${latestVersion}${releaseNotes}`,
          shouldExit: false,
        }
      }
      return {
        latestRelease,
        message: `Latest version available: ${latestVersion}`,
        shouldExit: false,
      }
    }
    return {
      latestRelease: null,
      shouldExit: false,
      warning: "No template releases found, proceeding with latest main branch",
    }
  })

const verifyCleanWorkingTree = () =>
  Effect.gen(function* () {
    const hasChanges = yield* checkForUncommittedChanges()
    if (hasChanges) {
      yield* Effect.fail(new WorkingTreeDirty())
    }
  })

const setupTempDirectory = () =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const exists = yield* fs.exists(TEMP_DIR)
    if (exists) {
      yield* fs.remove(TEMP_DIR, { recursive: true }).pipe(Effect.orElse(() => Effect.void))
    }
    yield* fs.makeDirectory(TEMP_DIR, { recursive: true }).pipe(Effect.orElse(() => Effect.void))
  })

const cloneAndAnalyze = () =>
  Effect.gen(function* () {
    yield* cloneTemplate()

    const [localFiles, templateFiles] = yield* Effect.all([getLocalFiles(), getTemplateFiles()], {
      concurrency: 2,
    })

    const { filesToUpdate, newFiles } = yield* getFileDiff(localFiles, templateFiles)

    return { filesToUpdate, newFiles }
  })

const applyChanges = (filesToCopy: string[], latestRelease: { tagName: string } | null) =>
  Effect.gen(function* () {
    const uniqueFilesToCopy = Array.from(new Set(filesToCopy))
    yield* copyFiles(uniqueFilesToCopy)

    yield* ShellCommand.make("git", "add", ".").pipe(
      ShellCommand.exitCode,
      Effect.orElse(() => Effect.void)
    )

    if (latestRelease) {
      yield* updateTemplateVersion(latestRelease.tagName)
      yield* ShellCommand.make("git", "add", ".template-version.json").pipe(
        ShellCommand.exitCode,
        Effect.orElse(() => Effect.void)
      )
    }
  })

const checkForUncommittedChanges = () =>
  ShellCommand.make("git", "status", "--porcelain").pipe(
    ShellCommand.string,
    Effect.map((status) => status.length > 0),
    Effect.catchAll(() => Effect.succeed(false))
  )

const cleanupTempDirectory = () =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const exists = yield* fs.exists(TEMP_DIR)
    if (exists) {
      yield* fs.remove(TEMP_DIR, { recursive: true }).pipe(Effect.orElse(() => Effect.void))
    }
  }).pipe(Effect.orElse(() => Effect.void))

export default Command.make("update").pipe(
  Command.withDescription("Sync with template updates"),
  Command.withHandler(() =>
    Effect.gen(function* () {
      yield* Console.log("\n🔄 Template Synchronization\n")

      yield* Console.log("   Checking for template updates...\n")
      const { shouldExit, latestRelease, message, warning } = yield* checkVersionUpdates()

      if (message) {
        if (message.includes("Already up to date")) {
          const versionMatch = message.match(/\(([^)]+)\)/)
          const version = versionMatch ? versionMatch[1] : ""
          yield* Console.log(`✅ Already up to date (${version})\n`)
        } else {
          yield* Console.log(`${message}\n`)
        }
      }
      if (warning) {
        yield* Console.log(`⚠️  ${warning}\n`)
      }
      if (shouldExit) {
        return
      }

      yield* Console.log("   Checking for uncommitted changes...\n")
      yield* verifyCleanWorkingTree()
      yield* Console.log("✅ Working directory clean\n")

      yield* Console.log("   Setting up temporary directory...\n")
      yield* setupTempDirectory()
      yield* Console.log("✅ Temporary directory created\n")

      yield* Console.log("   Cloning template repository...\n")
      const { filesToUpdate, newFiles } = yield* cloneAndAnalyze()
      yield* Console.log("✅ Template repository cloned\n")

      const allowedNewFiles = yield* filterNewFilesForExistingWorkspaces(newFiles)
      const filesToCopy = [...filesToUpdate, ...allowedNewFiles]

      if (filesToCopy.length === 0) {
        yield* Console.log("\n✅ No updates to apply - already up to date\n")
        return
      }

      yield* Console.log("   Applying template changes...\n")
      yield* applyChanges(filesToCopy, latestRelease)
      yield* Console.log("✅ Template changes applied\n")

      yield* Console.log("✅ Changes staged\n")
      yield* Console.log("   Please review the changes and commit them to your repository.\n")
      yield* Console.log("\n🎉 Template sync completed successfully!\n")
    }).pipe(Effect.ensuring(cleanupTempDirectory()))
  ),
  Command.provideEffectDiscard(requireInitProject())
)
