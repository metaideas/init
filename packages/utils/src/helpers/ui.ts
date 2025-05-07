import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { twMerge as _twMerge } from "tailwind-merge2"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * This is a temporary helper using the old version of tailwind-merge. Version 3
 * drops support for earlier Tailwind versions, and we have to wait for
 * Nativewind to support Tailwind 4.
 */
export function _cn(...inputs: ClassValue[]) {
  return _twMerge(clsx(inputs))
}
