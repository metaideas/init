import { cancel, isCancel, log, select, tasks } from "@clack/prompts"
import { spinner } from "@clack/prompts"
import { executeCommand, runScript } from "../tooling/helpers"

const REMOTE_URL = "git@github.com:adelrodriguez/init.git"

async function checkTemplateRemote(): Promise<string[]> {
  log.message("Checking for template remote...")
  const stdout = await executeCommand("git remote")
  return stdout.split("\n")
}

async function addTemplateRemote(): Promise<void> {
  await executeCommand(`git remote add template ${REMOTE_URL}`)
  log.success("Template remote added")
}

async function fetchTemplateRemote(): Promise<void> {
  await executeCommand("git fetch template")
  log.success("Template remote fetched")
}

async function checkForUncommittedChanges(): Promise<boolean> {
  log.message("Checking for uncommitted changes...")
  const status = await executeCommand("git status --porcelain")
  return status.length > 0
}

async function mergeTemplateRemote(): Promise<void> {
  const s = spinner()
  s.start("Merging template remote...")
  try {
    const currentBranch = (
      await executeCommand("git rev-parse --abbrev-ref HEAD")
    ).trim()
    await executeCommand("git checkout -b template-sync-temp")
    await executeCommand(
      "git merge --squash template/main --allow-unrelated-histories"
    )
    await executeCommand('git commit -m "chore: sync with template repository"')
    await executeCommand(`git checkout ${currentBranch}`)
    await executeCommand("git merge template-sync-temp --ff-only")
    await executeCommand("git branch -D template-sync-temp")
    s.stop("Template changes merged successfully as a single commit")
  } catch (error) {
    s.stop("Merge conflicts detected")

    // Clean up and provide guidance
    try {
      await executeCommand("git merge --abort")
      await executeCommand("git checkout -")
      await executeCommand("git branch -D template-sync-temp")

      log.error("Failed to sync with template. Here's what you can do:")
      log.message("\n1. Manual sync steps:")
      log.message("   git checkout -b template-sync")
      log.message("   git fetch template")
      log.message("   git merge --squash template/main")
      log.message("   # Resolve conflicts")
      log.message("   git add .")
      log.message("   git commit -m 'chore: sync with template repository'")
      log.message("\n2. Or reset everything and try again later:")
      log.message("   git reset --hard HEAD")
      log.message("   git clean -fd")

      log.message("\nAfter resolving conflicts, run this script again.")
    } catch (cleanupError) {
      log.error(
        `Additionally, cleanup failed: ${(cleanupError as Error).message}. Current git state might be inconsistent.`
      )
      log.message("You might need to manually run:")
      log.message("   git merge --abort")
      log.message("   git checkout <your-branch>")
      log.message("   git branch -D template-sync-temp")
    }

    throw error
  }
}

async function main() {
  // Check for uncommitted changes first
  const hasUncommittedChanges = await checkForUncommittedChanges()
  if (hasUncommittedChanges) {
    cancel(
      "Please commit or stash your changes before syncing with the template"
    )
    process.exit(1)
  }

  const remotes = await checkTemplateRemote()

  if (!remotes.includes("template")) {
    const confirmation = await select({
      message: "Do you want to add the template remote?",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    })

    if (!confirmation || isCancel(confirmation)) {
      cancel(
        `Please add the template remote by running the command: \`git remote add template ${REMOTE_URL}\``
      )
      process.exit(0)
    }

    await addTemplateRemote()
  }

  try {
    await tasks([
      {
        title: "Fetching template remote...",
        task: () => fetchTemplateRemote(),
      },
      {
        title: "Merging template remote...",
        task: () => mergeTemplateRemote(),
      },
    ])
  } catch (error) {
    log.error(`Ran into an error: ${(error as Error).message}`)

    cancel(
      "Failed to sync with template. Please resolve any conflicts manually."
    )
    process.exit(1)
  }
}

runScript(main)
