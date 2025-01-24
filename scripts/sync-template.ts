import { exec } from "node:child_process"
import { promisify } from "node:util"
import { cancel, isCancel, select, spinner } from "@clack/prompts"
import { runScript } from "../tooling/utils"

const REMOTE_URL = "git@github.com:adelrodriguez/init.git"
const execAsync = promisify(exec)

async function executeCommand(command: string): Promise<string> {
  const { stdout } = await execAsync(command)
  return stdout
}

async function checkTemplateRemote(): Promise<string[]> {
  const s = spinner()
  s.start("Checking for template remote...")
  const stdout = await executeCommand("git remote")
  s.stop()
  return stdout.split("\n")
}

async function addTemplateRemote(): Promise<void> {
  const s = spinner()
  s.start("Adding template remote...")
  await executeCommand(`git remote add template ${REMOTE_URL}`)
  s.stop("Template remote added")
}

async function fetchTemplateRemote(): Promise<void> {
  const s = spinner()
  s.start("Fetching template remote...")
  await executeCommand("git fetch template")
  s.stop("Template remote fetched")
}

async function mergeTemplateRemote(): Promise<void> {
  const s = spinner()
  s.start("Merging template remote...")
  await executeCommand("git merge template/main --allow-unrelated-histories")
  s.stop("Template remote merged. Please resolve any conflicts.")
}

async function syncTemplate() {
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

  await fetchTemplateRemote()
  await mergeTemplateRemote()
}

runScript(syncTemplate)
