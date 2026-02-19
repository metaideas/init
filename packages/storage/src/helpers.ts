import type standardTypes from "mime/types/standard.js"
import mime from "mime/lite"

export type MimeType = keyof typeof standardTypes
export type MimeTypeExtension<T extends MimeType> = (typeof standardTypes)[T][0]
export type MimeTypeExtensions<T extends MimeType> = (typeof standardTypes)[T][number]

export function getMimeType(filename: string): MimeType {
  return mime.getType(filename) as MimeType
}

export function getExtension<T extends MimeType>(mimeType: T): MimeTypeExtension<T> | null {
  return mime.getExtension(mimeType) as MimeTypeExtension<T> | null
}

export function getExtensions<T extends MimeType>(mimeType: T): Set<MimeTypeExtensions<T>> | null {
  return mime.getAllExtensions(mimeType) as Set<MimeTypeExtensions<T>> | null
}

export function sanitizeKey(key: string): string {
  // Only allow the safe set: 0-9 a-z A-Z ! - _ . * ' ( )
  // Replace any character not in safe set with underscore
  return key.replaceAll(/[^0-9a-zA-Z!\-_.*'()]/g, "_")
}
