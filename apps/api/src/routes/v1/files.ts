import { FilesError } from "files-sdk"
import { createFilesRouter } from "files-sdk/api"
import { createRouteHandler } from "files-sdk/hono"
import { auth } from "#shared/auth.ts"
import env from "#shared/env.ts"
import { files, FILES_MAX_UPLOAD_SIZE, FILES_MAX_URL_AGE } from "#shared/files.ts"
import { factory } from "#shared/utils.ts"

const router = createFilesRouter({
  allowedOrigins: env.ALLOWED_API_ORIGINS,
  authorize: async ({ req }) => {
    const session = await auth.api.getSession({ headers: req.headers })

    if (!session) throw new FilesError("Unauthorized", "Sign in to access files")

    return {
      disposition: "attachment",
      keyPrefix: `users/${session.user.id}/`,
      maxExpiresIn: FILES_MAX_URL_AGE,
      maxResults: 100,
    }
  },
  files,
  maxListLimit: 100,
  maxSearchResults: 100,
  maxUploadSize: FILES_MAX_UPLOAD_SIZE,
  secret: env.FILES_API_SECRET,
})

export default factory.createApp().all("/", createRouteHandler(router))
