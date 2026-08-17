import type { DeleteManyResult, StoredFile, UploadResult } from "files-sdk"
import { operators } from "@init/db/helpers"
import { assets, type UserId } from "@init/db/schema"
import * as z from "@init/utils/schema"
import { createFiles } from "files-sdk"
import { bunS3 } from "files-sdk/bun-s3"
import { contentType } from "files-sdk/content-type"
import { signedUrlPolicy } from "files-sdk/signed-url-policy"
import { validation } from "files-sdk/validation"
import type { AuthenticatedAppContext } from "#shared/types.ts"
import { ENV } from "#shared/env.generated.ts"
import { logger } from "#shared/logger.ts"
import { context } from "#shared/utils.ts"

export const FILES_MAX_UPLOAD_SIZE = 10 * 1024 * 1024
export const FILES_MAX_URL_AGE = 15 * 60

export const files = createFiles({
  adapter: bunS3({
    accessKeyId: ENV.S3_ACCESS_KEY_ID,
    bucket: ENV.S3_BUCKET,
    endpoint: ENV.S3_ENDPOINT,
    region: ENV.S3_REGION,
    secretAccessKey: ENV.S3_SECRET_ACCESS_KEY,
    virtualHostedStyle: !ENV.S3_ENDPOINT,
  }),
  hooks: {
    onAction(event) {
      if (event.status !== "success") return

      switch (event.type) {
        case "upload":
          if (event.key) handleUpload(event.key, event.result as UploadResult)
          break
        case "head":
          if (event.key) handleUpload(event.key, event.result as StoredFile)
          break
        case "delete": {
          const keys = event.key ? [event.key] : (event.result as DeleteManyResult).deleted

          handleDelete(keys)
          break
        }
        default:
          break
      }
    },
  },
  plugins: [
    signedUrlPolicy({
      maxExpiresIn: FILES_MAX_URL_AGE,
      maxUploadSize: FILES_MAX_UPLOAD_SIZE,
    }),
    validation({
      allowedTypes: ["image/*", "application/pdf"],
      key: (key) =>
        z
          .string()
          .regex(/^[\w.-]+(?:\/[\w.-]+)*$/u)
          .refine((value) =>
            value.split("/").every((segment) => segment !== "." && segment !== "..")
          )
          .safeParse(key).success,
      maxSize: FILES_MAX_UPLOAD_SIZE,
      minSize: 1,
    }),
    contentType({ onMismatch: "reject" }),
  ],
})

function handleUpload(key: string, file: UploadResult | StoredFile) {
  const ctx = context<AuthenticatedAppContext>()
  const mimeType = "contentType" in file ? file.contentType : file.type
  const name = "name" in file ? file.name : (key.split("/").at(-1) ?? key)

  void ctx.var.db
    .insert(assets)
    .values({
      etag: file.etag,
      key,
      lastModified: file.lastModified,
      metadata: "metadata" in file ? file.metadata : undefined,
      name,
      ownerId: ctx.var.session.user.id as UserId,
      size: file.size,
      type: mimeType,
      uploaderId: ctx.var.session.user.id as UserId,
    })
    .onConflictDoUpdate({
      set: {
        etag: file.etag,
        lastModified: file.lastModified,
        metadata: "metadata" in file ? file.metadata : undefined,
        name,
        size: file.size,
        type: mimeType,
        updatedAt: new Date(),
      },
      target: assets.key,
    })
    .catch((error: unknown) => {
      logger.error({ error, key, message: "Failed to record asset" })
    })
}

function handleDelete(keys: string[]) {
  if (keys.length === 0) return

  const ctx = context<AuthenticatedAppContext>()

  void ctx.var.db
    .delete(assets)
    .where(
      operators.and(
        operators.inArray(assets.key, keys),
        operators.eq(assets.ownerId, ctx.var.session.user.id as UserId)
      )
    )
    .catch((error: unknown) => {
      logger.error({ error, keys, message: "Failed to delete asset records" })
    })
}
