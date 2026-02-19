export const StorageBucket = {
  MAIN: "init-main",
  TEMP: "init-temp",
} as const

export const STORAGE_BUCKETS = Object.values(StorageBucket)
export type StorageBucket = (typeof STORAGE_BUCKETS)[number]
