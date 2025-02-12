import { copyFile, mkdir, rm } from "node:fs/promises"
import { dirname, join } from "node:path"
import { cancel, log, spinner } from "@clack/prompts"

import { executeCommand, runScript } from "../tooling/helpers"

const TEMP_DIR = ".template-sync-tmp"
const REMOTE_URL = "git@github.com:adelrodriguez/init.git"

async function cloneTemplate() {
  await executeCommand(`git clone ${REMOTE_URL} ${TEMP_DIR} --depth 1`)
}

async function getTemplateFiles(): Promise<string[]> {
  const output = await executeCommand(`git -C ${TEMP_DIR} ls-files`)
  return output.split("\n").filter(Boolean)
}

async function getLocalFiles(): Promise<string[]> {
  const output = await executeCommand("git ls-files")
  return output.split("\n").filter(Boolean)
}

async function getFileDiff(localFiles: string[], templateFiles: string[]) {
  const filesToUpdate: string[] = []
  const newFiles: string[] = []

  for (const file of templateFiles) {
    const isNew = !localFiles.includes(file)
    const hasLocalChanges = await executeCommand(
      `git diff --quiet HEAD -- ${file}`
    )
      .then(() => false)
      .catch(() => true)

    if (isNew) {
      newFiles.push(file)
    } else if (!hasLocalChanges) {
      filesToUpdate.push(file)
    }
  }

  return { filesToUpdate, newFiles }
}

async function copyFiles(files: string[]) {
  for (const file of files) {
    const source = join(TEMP_DIR, file)
    const dest = join(process.cwd(), file)

    await mkdir(dirname(dest), { recursive: true })
    await copyFile(source, dest)
  }
}

async function main() {
  log.message("Starting template synchronization")

  const s = spinner()
  try {
    // Verify clean working tree
    s.start("Checking for uncommitted changes")
    const hasChanges = await checkForUncommittedChanges()
    if (hasChanges) {
      cancel("Please commit or stash changes before syncing")
      process.exit(1)
    }
    s.stop("Working directory clean")

    // Set up temporary environment
    s.start("Setting up temporary directory")
    await rm(TEMP_DIR, { recursive: true, force: true })
    await mkdir(TEMP_DIR, { recursive: true })
    s.stop("Temporary directory created")

    // Clone template
    s.start("Cloning template repository")
    await cloneTemplate()
    s.stop("Template cloned")

    // Get file lists
    s.start("Analyzing file differences")
    const [localFiles, templateFiles] = await Promise.all([
      getLocalFiles(),
      getTemplateFiles(),
    ])

    const { filesToUpdate, newFiles } = await getFileDiff(
      localFiles,
      templateFiles
    )
    s.stop(
      `Found ${filesToUpdate.length} updates and ${newFiles.length} new files`
    )

    // Copy changes
    if (filesToUpdate.length > 0 || newFiles.length > 0) {
      s.start("Applying template changes")
      await Promise.all([copyFiles(filesToUpdate), copyFiles(newFiles)])
      s.stop("Changes applied")

      // Stage changes and set commit message
      await executeCommand("git add .")

      // Write commit message to Git's internal file
      const commitMessage = "chore: sync with template repository"
      await executeCommand(
        "git config --local commit.template .git/COMMIT_EDITMSG"
      )
      await executeCommand(`echo "${commitMessage}" > .git/COMMIT_EDITMSG`)

      log.success("Changes staged with suggested commit message")
      log.message("Open VS Code and check the Source Control view")
      log.message("The commit message will appear in the input box")
    } else {
      log.info("No changes to apply - already up to date")
    }

    log.message(
      "Template sync completed. Review and commit in VS Code when ready."
    )
  } catch (error) {
    s.stop("Sync failed")
    log.error(error instanceof Error ? error.message : "Unknown error occurred")
    process.exit(1)
  } finally {
    await rm(TEMP_DIR, { recursive: true, force: true })
  }
}

async function checkForUncommittedChanges(): Promise<boolean> {
  const status = await executeCommand("git status --porcelain")
  return status.length > 0
}

runScript(main)
