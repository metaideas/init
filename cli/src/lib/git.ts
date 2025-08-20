import { executeCommand } from "./exec"

export async function isGitRepository(): Promise<boolean> {
  try {
    await executeCommand("git rev-parse --git-dir")
    return true
  } catch {
    return false
  }
}

export async function hasUncommittedChanges(): Promise<boolean> {
  const status = await executeCommand("git status --porcelain")
  return status.length > 0
}

export async function initGitRepository(): Promise<void> {
  await executeCommand("git init")
}

export async function addRemote(name: string, url: string): Promise<void> {
  try {
    await executeCommand(`git remote get-url ${name}`)
  } catch {
    await executeCommand(`git remote add ${name} ${url}`)
  }
}

export async function getGitFiles(): Promise<string[]> {
  const output = await executeCommand("git ls-files")
  return output.split("\n").filter(Boolean)
}

export async function stageAll(): Promise<void> {
  await executeCommand("git add .")
}

export async function cloneRepository(
  url: string,
  directory: string,
  options: string[] = []
): Promise<void> {
  const optionsStr = options.join(" ")
  await executeCommand(`git clone ${url} ${directory} ${optionsStr}`)
}

export async function getGitFilesInDirectory(
  directory: string
): Promise<string[]> {
  const output = await executeCommand(`git -C ${directory} ls-files`)
  return output.split("\n").filter(Boolean)
}

export async function hasFileChanges(file: string): Promise<boolean> {
  try {
    await executeCommand(`git diff --quiet HEAD -- ${file}`)
    return false
  } catch {
    return true
  }
}

export async function stageFile(file: string): Promise<void> {
  await executeCommand(`git add ${file}`)
}
