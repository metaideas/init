export type RuntimeEnv = Record<string, string | boolean | undefined>

type ImportMetaWithEnv = ImportMeta & {
  env?: RuntimeEnv
}

export function getRuntimeEnv(): RuntimeEnv {
  const meta = (import.meta as ImportMetaWithEnv).env ?? {}
  const node = "process" in globalThis ? (globalThis.process.env as RuntimeEnv) : {}
  return { ...meta, ...node }
}
