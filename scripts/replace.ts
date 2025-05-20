import fs from "node:fs"
import path from "node:path"
import { log } from "@clack/prompts"
import { runScript } from "../tooling/helpers"

const EXCLUDED_DIRS = [
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "out",
  ".turbo",
  ".vercel",
  ".DS_Store",
  ".cache",
  ".pnpm-store",
  ".yarn",
] as const

function checkShouldExclude(filePath: string): boolean {
  return EXCLUDED_DIRS.some(
    dir =>
      filePath.includes(`${path.sep}${dir}${path.sep}`) ||
      filePath.endsWith(`${path.sep}${dir}`)
  )
}

function getAllFilesRecursively(dir: string, files: string[] = []): string[] {
  if (checkShouldExclude(dir)) {
    return files
  }

  try {
    for (const file of fs.readdirSync(dir)) {
      const filePath = path.join(dir, file)

      if (checkShouldExclude(filePath)) {
        continue
      }

      const stat = fs.statSync(filePath)
      stat.isDirectory()
        ? getAllFilesRecursively(filePath, files)
        : files.push(filePath)
    }
  } catch (error: unknown) {
    log.error(
      `Could not read directory ${dir}: ${error instanceof Error ? error.message : "Unknown error"}`
    )
  }

  return files
}

function getReplacementCount(content: string, from: string): number {
  const regex = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")
  return (content.match(regex) || []).length
}

function getProjectName() {
  if (process.argv[2]) {
    return process.argv[2]
  }

  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf-8"))
  return packageJson.name
}

async function main() {
  const projectName = getProjectName()

  log.info(
    `Searching for "@init" in project files (excluding node_modules, .git, etc.) to replace with "@${projectName}"...`
  )

  const rootDir = path.join(__dirname, "..")

  const allFiles = getAllFilesRecursively(rootDir)
  let totalReplacements = 0
  let filesChanged = 0

  for (const file of allFiles) {
    try {
      if (file.endsWith("pnpm-lock.yaml")) {
        continue
      }

      const content = await fs.promises.readFile(file, "utf8")
      // Check for "@init" to catch instances like "@init/some-package" or "@init" as a whole word.
      if (!content.includes("@init")) {
        continue
      }

      const count = getReplacementCount(content, "@init")
      if (!count) {
        continue
      }

      filesChanged++
      totalReplacements += count

      const replaced = content.split("@init").join(`@${projectName}`)

      fs.writeFileSync(file, replaced, "utf8")
    } catch (error: unknown) {
      if (error instanceof Error) {
        log.warn(
          `Could not process file ${file} for renaming: ${error.message}`
        )

        continue
      }

      log.warn(`Could not process file ${file} for renaming: Unknown error`)
    }
  }

  if (filesChanged > 0) {
    log.success(
      `Replaced ${totalReplacements} instance(s) of '@init' with '@${projectName}' in ${filesChanged} file(s).`
    )

    return
  }

  log.info("No instances of '@init' found to replace in files.")
}

runScript(main)
