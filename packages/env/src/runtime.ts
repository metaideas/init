import { env } from "std-env"

export type RuntimeEnv = Record<string, string | boolean | undefined>

export function getRuntimeEnv(): RuntimeEnv {
  return { ...import.meta.env, ...env }
}
