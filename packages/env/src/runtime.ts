export type RuntimeEnv = Record<string, string | boolean | undefined>

export function getRuntimeEnv(): RuntimeEnv {
  const meta = import.meta.env ?? {}
  const node = globalThis.process?.env ?? {}
  return { ...meta, ...node }
}
