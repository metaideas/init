import fs from "node:fs"
import path from "node:path"
import { intro, log } from "@clack/prompts"
import { runScript } from "../tooling/helpers"

async function copyEnvFile(sourcePath: string, targetPath: string) {
  try {
    // Check if source exists first
    await fs.promises.access(sourcePath)

    // Check if target already exists
    try {
      await fs.promises.access(targetPath)
      log.info(`Skipping ${targetPath} (already exists)`)
      return
    } catch {
      // Target doesn't exist, proceed with copy
      await fs.promises.copyFile(sourcePath, targetPath)
      log.success(`Created ${targetPath}`)
    }
  } catch (error) {
    if (error.code === "ENOENT") {
      // Skip if source file doesn't exist
      log.warning(`No example file found at ${sourcePath}`)
      return
    }
    throw error
  }
}

async function setupWorkspaceEnv(workspacePath: string) {
  const workspaceName = path.basename(workspacePath)
  log.step(`Processing ${workspaceName}...`)

  // Check for Cloudflare Workers config (.dev.vars)
  const devVarsExample = path.join(workspacePath, ".dev.vars.example")
  const devVars = path.join(workspacePath, ".dev.vars")
  await copyEnvFile(devVarsExample, devVars)

  // Check for regular .env
  const envExample = path.join(workspacePath, ".env.example")
  const env = path.join(workspacePath, ".env")
  await copyEnvFile(envExample, env)
}

async function main() {
  intro("Setting up environment files...")

  const workspaceTypes = ["apps", "packages"]
  let processedCount = 0

  for (const type of workspaceTypes) {
    const workspaceDir = path.join(__dirname, "..", type)

    try {
      const directories = await fs.promises.readdir(workspaceDir, {
        withFileTypes: true,
      })

      for (const dirent of directories) {
        if (dirent.isDirectory()) {
          const workspacePath = path.join(workspaceDir, dirent.name)
          await setupWorkspaceEnv(workspacePath)
          processedCount++
        }
      }
    } catch (error) {
      if (error.code === "ENOENT") {
        // Skip if workspace type directory doesn't exist
        log.info(`No ${type} directory found, skipping...`)
        continue
      }
      throw error
    }
  }

  log.success(`Processed ${processedCount} workspaces`)
}

runScript(main)
