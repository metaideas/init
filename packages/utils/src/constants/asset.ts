import type standardTypes from "mime/types/standard.js"

export type MimeType = keyof typeof standardTypes
export type MimeTypeExtension<T extends MimeType> = (typeof standardTypes)[T][0]
export type MimeTypeExtensions<T extends MimeType> = (typeof standardTypes)[T][number]

export const StorageBucket = {
  MAIN: "init-main",
  TEMP: "init-temp",
} as const

export const STORAGE_BUCKETS = Object.values(StorageBucket)
export type StorageBucket = (typeof STORAGE_BUCKETS)[number]
