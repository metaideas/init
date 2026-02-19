import type { StorageBucket } from "@init/storage/buckets"
import { s3 as s3Env } from "@init/env/presets"
import { S3Client, type S3Options } from "bun"

/**
 * @param bucketName - The name of the bucket to use.
 * @param options - Additional options that you can use to override the default environment variables.
 */
export function createStorage(bucketName: StorageBucket, options?: S3Options) {
  const env = s3Env()

  return new S3Client({
    accessKeyId: options?.accessKeyId ?? env.S3_ACCESS_KEY_ID,
    bucket: bucketName,
    endpoint: options?.endpoint ?? env.S3_ENDPOINT,
    region: options?.region ?? env.S3_REGION,
    secretAccessKey: options?.secretAccessKey ?? env.S3_SECRET_ACCESS_KEY,
  })
}
