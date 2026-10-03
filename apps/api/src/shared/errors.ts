import * as Faultier from "faultier"

/**
 * A storage action succeeded, but its result could not be turned into asset records.
 */
export class FileActionError extends Faultier.Tagged("FileActionError")<{
  action: string
}>() {}

export class AssetRecordError extends Faultier.Tagged("AssetRecordError")<{
  keys: string[]
  operation: "delete" | "upsert"
}>() {}

export const FilesFault = Faultier.registry({ AssetRecordError, FileActionError })
