import { createFilesRouter } from "files-sdk/api"
import { createRouteHandler } from "files-sdk/hono"
import type { AuthenticatedAppContext } from "#shared/types.ts"
import env from "#shared/env.ts"
import { files, FILES_MAX_UPLOAD_SIZE, FILES_MAX_URL_AGE } from "#shared/files.ts"
import { requireSession } from "#shared/middleware.ts"
import { context, factory } from "#shared/utils.ts"

const router = createFilesRouter({
  allowedOrigins: env.ALLOWED_API_ORIGINS,
  authorize: () => {
    const ctx = context<AuthenticatedAppContext>()

    return {
      disposition: "attachment",
      keyPrefix: `users/${ctx.var.session.user.id}/`,
      maxExpiresIn: FILES_MAX_URL_AGE,
      maxResults: 100,
    }
  },
  files,
  maxListLimit: 100,
  maxSearchResults: 100,
  maxUploadSize: FILES_MAX_UPLOAD_SIZE,
  operations: [
    "capabilities",
    "delete",
    "download",
    "exists",
    "head",
    "list",
    "search",
    "signedUploadUrl",
    "upload",
    "url",
  ],
  secret: env.FILES_API_SECRET,
})

export default factory.createApp().all("/", requireSession, createRouteHandler(router))
