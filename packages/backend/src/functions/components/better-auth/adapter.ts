import { createApi } from "@convex-dev/better-auth"
import { authOptions } from "#functions/shared/auth/options.ts"
import schema from "./schema"

export const { create, findOne, findMany, updateOne, updateMany, deleteOne, deleteMany } =
  createApi(schema, authOptions)
