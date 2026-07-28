import { dirname, join } from "node:path"
import process from "node:process"
import * as Effect from "effect/Effect"
import * as FileSystem from "effect/FileSystem"
import * as Command from "effect/unstable/cli/Command"
import {
  CommandRunner,
  getCommandOutput,
  requireTool,
  runCommand,
} from "#lib/services/command-runner.ts"
import { Prompter } from "#lib/services/prompter.ts"
import { ReleaseClient } from "#lib/services/release-client.ts"
import { CommandFailed, WorkingTreeDirty } from "#lib/shared/errors.ts"
import { checkIsInternalPath } from "#lib/shared/internal-paths.ts"
import {
  compareVersions,
  getVersion,
  requireInitProject,
  type ReleaseInfo,
  updateTemplateVersion,
} from "#lib/shared/releases.ts"

const TEMP_DIR = ".template-sync-tmp"
const REMOTE_URL = "https://github.com/metaideas/init.git"

const cloneTemplate = () =>
  runCommand({
    args: ["clone", REMOTE_URL, TEMP_DIR, "--depth", "1", "--quiet"],
    command: "git",
  })

const getGitFiles = (args: string[]) =>
  getCommandOutput({ args, command: "git" }).pipe(
    Effect.map((output) => output.split("\n").filter(Boolean))
  )

export const getFileDiff = Effect.fn("getFileDiff")(function* (
  localFiles: string[],
  templateFiles: string[]
) {
  const runner = yield* CommandRunner
  const fileChecks = yield* Effect.forEach(
    templateFiles.filter((file) => !checkIsInternalPath(file)),
    (file) =>
      Effect.gen(function* () {
        const isNew = !localFiles.includes(file)
        if (isNew) return { file, hasLocalChanges: false, isNew }

        const exitCode = yield* runner.run({
          args: ["diff", "--quiet", "HEAD", "--", file],
          command: "git",
          stderr: "ignore",
          stdout: "ignore",
        })
        if (Number(exitCode) > 1) {
          return yield* Effect.fail(new CommandFailed({ command: "git", exitCode }))
        }
        return { file, hasLocalChanges: Number(exitCode) === 1, isNew }
      }),
    { concurrency: 10 }
  )

  return {
    filesToUpdate: fileChecks
      .filter(({ hasLocalChanges, isNew }) => !isNew && !hasLocalChanges)
      .map(({ file }) => file),
    newFiles: fileChecks.filter(({ isNew }) => isNew).map(({ file }) => file),
  }
})

const copyFiles = Effect.fn("copyFiles")(function* (files: string[]) {
  const fs = yield* FileSystem.FileSystem
  yield* Effect.forEach(
    files,
    (file) =>
      Effect.gen(function* () {
        const destination = join(process.cwd(), file)
        yield* fs.makeDirectory(dirname(destination), { recursive: true })
        yield* fs.writeFile(destination, yield* fs.readFile(join(TEMP_DIR, file)))
      }),
    { concurrency: 10, discard: true }
  )
})

const getExistingWorkspaceNames = Effect.fn("getExistingWorkspaceNames")(function* (
  workspaceRoot: "apps" | "packages"
) {
  const fs = yield* FileSystem.FileSystem
  if (!(yield* fs.exists(workspaceRoot))) return new Set<string>()
  return new Set(yield* fs.readDirectory(workspaceRoot))
})

const filterNewFilesForExistingWorkspaces = Effect.fn("filterNewFilesForExistingWorkspaces")(
  function* (newFiles: string[]) {
    const [existingApps, existingPackages] = yield* Effect.all(
      [getExistingWorkspaceNames("apps"), getExistingWorkspaceNames("packages")],
      { concurrency: 2 }
    )

    return newFiles.filter((filePath) => {
      if (checkIsInternalPath(filePath)) return false
      const [root, workspaceName] = filePath.split("/")
      if (root === "apps") return workspaceName !== undefined && existingApps.has(workspaceName)
      if (root === "packages") {
        return workspaceName !== undefined && existingPackages.has(workspaceName)
      }
      return true
    })
  }
)

const checkVersionUpdates = Effect.fn("checkVersionUpdates")(function* () {
  const releases = yield* ReleaseClient
  const [currentVersion, latestRelease] = yield* Effect.all([getVersion(), releases.getLatest()], {
    concurrency: 2,
  })
  const latestVersion = latestRelease.tagName

  if (!currentVersion) {
    return {
      latestRelease,
      message: `Latest version available: ${latestVersion}`,
      shouldExit: false,
    }
  }

  const comparison = yield* compareVersions(currentVersion, latestVersion)
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
})

const checkForUncommittedChanges = () =>
  getCommandOutput({ args: ["status", "--porcelain"], command: "git" }).pipe(
    Effect.map((status) => status.length > 0)
  )

const verifyCleanWorkingTree = Effect.fn("verifyCleanWorkingTree")(function* () {
  if (yield* checkForUncommittedChanges()) return yield* Effect.fail(new WorkingTreeDirty())
})

const setupTempDirectory = Effect.fn("setupTempDirectory")(function* () {
  const fs = yield* FileSystem.FileSystem
  yield* fs.remove(TEMP_DIR, { force: true, recursive: true })
  yield* fs.makeDirectory(TEMP_DIR, { recursive: true })
})

const cloneAndAnalyze = Effect.fn("cloneAndAnalyze")(function* () {
  yield* cloneTemplate()
  const [localFiles, templateFiles] = yield* Effect.all(
    [getGitFiles(["ls-files"]), getGitFiles(["-C", TEMP_DIR, "ls-files"])],
    { concurrency: 2 }
  )
  return yield* getFileDiff(localFiles, templateFiles)
})

const applyChanges = Effect.fn("applyChanges")(function* (
  filesToCopy: string[],
  latestRelease: ReleaseInfo
) {
  const uniqueFilesToCopy = [...new Set(filesToCopy)]
  yield* copyFiles(uniqueFilesToCopy)
  if (uniqueFilesToCopy.length > 0) {
    yield* runCommand({ args: ["add", "--", ...uniqueFilesToCopy], command: "git" })
  }

  yield* updateTemplateVersion(latestRelease.tagName)
  yield* runCommand({ args: ["add", ".template-version.json"], command: "git" })
})

const cleanupTempDirectory = Effect.fn("cleanupTempDirectory")(function* () {
  const fs = yield* FileSystem.FileSystem
  yield* fs.remove(TEMP_DIR, { force: true, recursive: true })
})

export default Command.make("update").pipe(
  Command.withDescription("Sync with template updates"),
  Command.withHandler(() =>
    Effect.gen(function* () {
      yield* requireInitProject()
      yield* requireTool("git")
      const prompter = yield* Prompter

      yield* prompter.intro("🔄 Template Synchronization")
      yield* prompter.log.info("Checking for template updates...")
      const { shouldExit, latestRelease, message, warning } = yield* checkVersionUpdates()

      if (message) yield* prompter.log.info(message)
      if (warning) yield* prompter.log.warning(warning)
      if (shouldExit) {
        yield* prompter.outro("✅ Template is already up to date.")
        return
      }

      yield* prompter.log.info("Checking for uncommitted changes...")
      yield* verifyCleanWorkingTree()
      yield* prompter.log.success("Working directory clean")

      yield* prompter.log.info("Setting up temporary directory...")
      yield* setupTempDirectory()
      yield* prompter.log.success("Temporary directory created")

      yield* prompter.log.info("Cloning template repository...")
      const { filesToUpdate, newFiles } = yield* cloneAndAnalyze()
      yield* prompter.log.success("Template repository cloned")

      const filesToCopy = [
        ...filesToUpdate.filter((file) => !checkIsInternalPath(file)),
        ...(yield* filterNewFilesForExistingWorkspaces(newFiles)),
      ]
      if (filesToCopy.length === 0) {
        yield* prompter.log.success("No file updates to apply")
      }

      yield* prompter.log.info("Applying template changes...")
      yield* applyChanges(filesToCopy, latestRelease)
      yield* prompter.log.success("Template changes applied and staged")
      yield* prompter.log.info("Please review the changes and commit them to your repository.")
      yield* prompter.outro("🎉 Template sync completed successfully!")
    }).pipe(
      Effect.ensuring(
        cleanupTempDirectory().pipe(
          Effect.catch((error) =>
            Effect.gen(function* () {
              const cleanupPrompter = yield* Prompter
              yield* cleanupPrompter.log.warning(`Failed to clean up ${TEMP_DIR}: ${String(error)}`)
            })
          )
        )
      )
    )
  )
)
