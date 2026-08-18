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
import { context } from "#shared/utils.ts"

export const FILES_MAX_UPLOAD_SIZE = 10 * 1024 * 1024
export const FILES_MAX_URL_AGE = 15 * 60

const userIdSchema = z.branded("UserId")
const uploadResultSchema = z.object({
  contentType: z.string(),
  etag: z.string(),
  lastModified: z.number(),
  metadata: z.record(z.string(), z.string()).optional(),
  name: z.string(),
  size: z.number(),
})
const storedFileSchema = z.object({
  etag: z.string(),
  lastModified: z.number(),
  metadata: z.record(z.string(), z.string()).optional(),
  size: z.number(),
  type: z.string(),
})
const deleteManyResultSchema = z.object({ deleted: z.array(z.string()) })

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
          if (event.key) handleUpload(event.key, uploadResultSchema.parse(event.result))
          break
        case "head":
          if (event.key) handleUpload(event.key, storedFileSchema.parse(event.result))
          break
        case "delete": {
          const keys = event.key ? [event.key] : deleteManyResultSchema.parse(event.result).deleted

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

type ParsedUploadResult = z.infer<typeof uploadResultSchema>
type ParsedStoredFile = z.infer<typeof storedFileSchema>

function handleUpload(key: string, file: ParsedUploadResult | ParsedStoredFile) {
  const ctx = context<AuthenticatedAppContext>()
  const mimeType = "contentType" in file ? file.contentType : file.type
  const name = "name" in file ? file.name : (key.split("/").at(-1) ?? key)
  const userId: UserId = userIdSchema.parse(ctx.var.session.user.id)
  const logFailure = (cause: unknown) => {
    ctx.var.logger.error(`Failed to record asset: ${String(cause)}`)
  }

  void ctx.var.db
    .insert(assets)
    .values({
      etag: file.etag,
      key,
      lastModified: file.lastModified,
      metadata: "metadata" in file ? file.metadata : undefined,
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
        metadata: "metadata" in file ? file.metadata : undefined,
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
  const userId: UserId = userIdSchema.parse(ctx.var.session.user.id)
  const logFailure = (cause: unknown) => {
    ctx.var.logger.error(`Failed to delete asset records: ${String(cause)}`)
  }

  void ctx.var.db
    .delete(assets)
    .where(operators.and(operators.inArray(assets.key, keys), operators.eq(assets.ownerId, userId)))
    .catch(logFailure)
}
