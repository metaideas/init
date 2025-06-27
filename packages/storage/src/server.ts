import { createUploadthing } from "uploadthing/server"

export {
  createRouteHandler,
  extractRouterConfig,
  type FileRouter,
  UploadThingError as UploadError,
} from "uploadthing/server"

export const storage = createUploadthing()
