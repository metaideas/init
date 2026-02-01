import { resolve } from "node:path"
import { fileURLToPath } from "node:url"
import createJiti from "jiti"
import { loadEnv } from "vite"

const jiti = createJiti(fileURLToPath(import.meta.url))

// Callers may choose to void this promise to keep configs synchronous.
export async function ensureEnv(
  mode: string,
  cwd = process.cwd(),
  envPath = "./src/shared/env.ts"
) {
  const env = loadEnv(mode, cwd, "")
  Object.assign(process.env, env)
  await jiti.import(resolve(cwd, envPath))
  return env
}
