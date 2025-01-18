import { createUploadthing } from "uploadthing/server"

export { type FileRouter, createRouteHandler } from "uploadthing/server"
export {
  UploadThingError as UploadError,
  extractRouterConfig,
} from "uploadthing/server"

export const storage = createUploadthing()
