import { operators } from "@init/db/helpers/sql"
import { assets, type UserId, UserIdSchema } from "@init/db/schema"
import * as z from "@init/utils/schema"
import { createFiles } from "files-sdk"
import { bunS3 } from "files-sdk/bun-s3"
import { contentType } from "files-sdk/content-type"
import { signedUrlPolicy } from "files-sdk/signed-url-policy"
import { validation } from "files-sdk/validation"
import type { AuthenticatedAppContext } from "#shared/types.ts"
import { ENV } from "#shared/env.generated.ts"
import { context } from "#shared/utils.ts"

export const FILES_MAX_UPLOAD_SIZE = 10 * 1024 * 1024
export const FILES_MAX_URL_AGE = 15 * 60

const UploadResultSchema = z.object({
  contentType: z.string(),
  etag: z.string().optional(),
  lastModified: z.number().optional(),
  size: z.number(),
})
const StoredFileSchema = z.object({
  etag: z.string().optional(),
  lastModified: z.number().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
  name: z.string(),
  size: z.number(),
  type: z.string(),
})
const DeleteManyResultSchema = z.object({ deleted: z.array(z.string()) })

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

      try {
        switch (event.type) {
          case "upload":
            if (event.key) handleUpload(event.key, UploadResultSchema.parse(event.result))
            break
          case "head":
            if (event.key) handleUpload(event.key, StoredFileSchema.parse(event.result))
            break
          case "delete": {
            const keys = event.key
              ? [event.key]
              : DeleteManyResultSchema.parse(event.result).deleted

            handleDelete(keys)
            break
          }
          default:
            break
        }
      } catch (error) {
        const ctx = context<AuthenticatedAppContext>()
        ctx.var.logger.error(
          `Failed to process successful ${event.type} file action: ${String(error)}`
        )
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

type ParsedUploadResult = z.infer<typeof UploadResultSchema>
type ParsedStoredFile = z.infer<typeof StoredFileSchema>

function handleUpload(key: string, file: ParsedUploadResult | ParsedStoredFile) {
  const ctx = context<AuthenticatedAppContext>()
  const isUploadResult = "contentType" in file
  const mimeType = isUploadResult ? file.contentType : file.type
  const metadata = isUploadResult ? undefined : file.metadata
  const name = isUploadResult ? (key.split("/").at(-1) ?? key) : file.name
  const userId: UserId = UserIdSchema.parse(ctx.var.session.user.id)
  const logFailure = (cause: unknown) => {
    ctx.var.logger.error(`Failed to record asset: ${String(cause)}`)
  }

  void ctx.var.db
    .insert(assets)
    .values({
      etag: file.etag,
      key,
      lastModified: file.lastModified,
      metadata,
      name,
      ownerId: userId,
      size: file.size,
      type: mimeType,
      uploaderId: userId,
    })
    .onConflictDoUpdate({
      set: {
        etag: file.etag,
        lastModified: file.lastModified,
        metadata,
        name,
        size: file.size,
        type: mimeType,
        updatedAt: new Date(),
      },
      target: assets.key,
    })
    .catch(logFailure)
}

function handleDelete(keys: string[]) {
  if (keys.length === 0) return

  const ctx = context<AuthenticatedAppContext>()
  const userId: UserId = UserIdSchema.parse(ctx.var.session.user.id)
  const logFailure = (cause: unknown) => {
    ctx.var.logger.error(`Failed to delete asset records: ${String(cause)}`)
  }

  void ctx.var.db
    .delete(assets)
    .where(operators.and(operators.inArray(assets.key, keys), operators.eq(assets.ownerId, userId)))
    .catch(logFailure)
}
