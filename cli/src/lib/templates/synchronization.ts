import { dirname, join } from "node:path"
import process from "node:process"
import * as Effect from "effect/Effect"
import * as FileSystem from "effect/FileSystem"
import { CommandFailed, WorkingTreeDirty } from "#lib/core/errors.ts"
import { CommandRunner, runCommand } from "#lib/services/command-runner.ts"
import { Prompter } from "#lib/services/prompter.ts"
import { readManifest } from "#lib/templates/manifest.ts"
import { checkIsInternalPath } from "#lib/templates/paths.ts"
import { getTemplateVersionStatus } from "#lib/templates/releases.ts"
import { type ReleaseInfo, updateTemplateVersion } from "#lib/templates/versions.ts"

const REMOTE_URL = "https://github.com/metaideas/init.git"

const getGitFiles = Effect.fn("getGitFiles")(function* (args: string[]) {
  const runner = yield* CommandRunner
  const output = yield* runner.string({ args, command: "git" })
  return output.split("\n").filter(Boolean)
})

export const getFileDiff = Effect.fn("getFileDiff")(function* (
  localFiles: string[],
  templateFiles: string[],
  internalPaths: readonly string[] = []
) {
  const runner = yield* CommandRunner
  const fileChecks = yield* Effect.forEach(
    templateFiles.filter((file) => !checkIsInternalPath(file, internalPaths)),
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

const getExistingWorkspaceNames = Effect.fn("getExistingWorkspaceNames")(function* (
  workspaceRoot: "apps" | "packages"
) {
  const fs = yield* FileSystem.FileSystem
  if (!(yield* fs.exists(workspaceRoot))) return new Set<string>()
  return new Set(yield* fs.readDirectory(workspaceRoot))
})

const filterNewFilesForExistingWorkspaces = Effect.fn("filterNewFilesForExistingWorkspaces")(
  function* (newFiles: string[], internalPaths: readonly string[]) {
    const [existingApps, existingPackages] = yield* Effect.all(
      [getExistingWorkspaceNames("apps"), getExistingWorkspaceNames("packages")],
      { concurrency: 2 }
    )

    return newFiles.filter((filePath) => {
      if (checkIsInternalPath(filePath, internalPaths)) return false
      const [root, workspaceName] = filePath.split("/")
      if (root === "apps") return workspaceName !== undefined && existingApps.has(workspaceName)
      if (root === "packages") {
        return workspaceName !== undefined && existingPackages.has(workspaceName)
      }
      return true
    })
  }
)

export const getTemplateUpdate = Effect.fn("getTemplateUpdate")(function* () {
  const version = yield* getTemplateVersionStatus()
  const latestVersion = version.latestRelease.tagName

  if (version.status === "unknown") {
    return {
      latestRelease: version.latestRelease,
      message: `Latest version available: ${latestVersion}`,
      shouldExit: false,
    }
  }
  if (version.status === "current") {
    return {
      latestRelease: version.latestRelease,
      message: `Already up to date (${version.currentVersion})`,
      shouldExit: true,
    }
  }
  if (version.status === "ahead") {
    return {
      latestRelease: version.latestRelease,
      shouldExit: false,
      warning: `Local version (${version.currentVersion}) is newer than latest release (${latestVersion})`,
    }
  }

  const releaseNotes = version.latestRelease.body
    ? `\nRelease notes:\n${version.latestRelease.body}`
    : ""
  return {
    latestRelease: version.latestRelease,
    message: `Update available: ${version.currentVersion} → ${latestVersion}${releaseNotes}`,
    shouldExit: false,
  }
})

export const verifyCleanWorkingTree = Effect.fn("verifyCleanWorkingTree")(function* () {
  const runner = yield* CommandRunner
  const status = yield* runner.string({ args: ["status", "--porcelain"], command: "git" })
  if (status.length > 0) return yield* Effect.fail(new WorkingTreeDirty())
})

export const acquireTemplateDirectory = Effect.fn("acquireTemplateDirectory")(function* () {
  const fs = yield* FileSystem.FileSystem
  const prompter = yield* Prompter
  return yield* Effect.acquireRelease(
    fs.makeTempDirectory({ prefix: "init-update-" }),
    (temporaryDirectory) =>
      fs
        .remove(temporaryDirectory, { force: true, recursive: true })
        .pipe(
          Effect.catch((error) =>
            prompter.log.warning(`Failed to clean up ${temporaryDirectory}: ${String(error)}`)
          )
        )
  )
})

export const analyzeTemplateUpdate = Effect.fn("analyzeTemplateUpdate")(function* (
  temporaryDirectory: string
) {
  yield* runCommand({
    args: ["clone", REMOTE_URL, temporaryDirectory, "--depth", "1", "--quiet"],
    command: "git",
  })
  const manifest = yield* readManifest(`${temporaryDirectory}/manifest.json`)
  const [localFiles, templateFiles] = yield* Effect.all(
    [getGitFiles(["ls-files"]), getGitFiles(["-C", temporaryDirectory, "ls-files"])],
    { concurrency: 2 }
  )
  const internalPaths = [...manifest.cleanupPaths, ...manifest.excludedPaths]
  const { filesToUpdate, newFiles } = yield* getFileDiff(localFiles, templateFiles, internalPaths)
  const filesToCopy = [
    ...filesToUpdate,
    ...(yield* filterNewFilesForExistingWorkspaces(newFiles, internalPaths)),
  ]

  return filesToCopy
})

export const applyTemplateUpdate = Effect.fn("applyTemplateUpdate")(function* (
  temporaryDirectory: string,
  filesToCopy: string[],
  latestRelease: ReleaseInfo
) {
  const fs = yield* FileSystem.FileSystem
  const uniqueFilesToCopy = [...new Set(filesToCopy)]
  yield* Effect.forEach(
    uniqueFilesToCopy,
    (file) =>
      Effect.gen(function* () {
        const destination = join(process.cwd(), file)
        yield* fs.makeDirectory(dirname(destination), { recursive: true })
        yield* fs.writeFile(destination, yield* fs.readFile(join(temporaryDirectory, file)))
      }),
    { concurrency: 10, discard: true }
  )
  if (uniqueFilesToCopy.length > 0) {
    yield* runCommand({ args: ["add", "--", ...uniqueFilesToCopy], command: "git" })
  }

  yield* updateTemplateVersion(latestRelease.tagName)
  yield* runCommand({ args: ["add", ".template-version.json"], command: "git" })
})
