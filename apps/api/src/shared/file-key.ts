import * as z from "@init/utils/schema"

/**
 * Object keys the Files SDK gateway accepts: slash-separated segments of word characters, dots, and
 * dashes, with no `.` or `..` segments.
 */
export const FileKeySchema = z
  .string()
  .regex(/^[\w.-]+(?:\/[\w.-]+)*$/u)
  .refine((value) => value.split("/").every((segment) => segment !== "." && segment !== ".."))
