import { resolve } from "node:path"
import createJiti from "jiti"
import { loadEnv } from "vite"

const jiti = createJiti(import.meta.filename)

export async function ensureEnv(mode: string, cwd: string, envPath = "./src/shared/env.ts") {
  const env = loadEnv(mode, cwd, "")
  Object.assign(process.env, env)
  await jiti.import(resolve(cwd, envPath))
  return env
}
