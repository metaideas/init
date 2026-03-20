import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import createJiti from "jiti"
import { loadEnv } from "vite"

const jiti = createJiti(fileURLToPath(import.meta.url))

export async function ensureEnv(
  mode: string,
  workspaceDirOrFileUrl: string,
  envPath = "./src/shared/env.ts"
) {
  const workspaceDir = workspaceDirOrFileUrl.startsWith("file:")
    ? fileURLToPath(new URL(".", workspaceDirOrFileUrl))
    : workspaceDirOrFileUrl

  const env = loadEnv(mode, workspaceDir, "")
  Object.assign(process.env, env)
  await jiti.import(resolve(workspaceDir, envPath))
  return env
}
