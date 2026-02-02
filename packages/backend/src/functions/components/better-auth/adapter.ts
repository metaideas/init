import { createApi } from "@convex-dev/better-auth"
import schema from "#functions/components/better-auth/schema.ts"
import { authOptions } from "#functions/shared/auth/options.ts"

export const { create, findOne, findMany, updateOne, updateMany, deleteOne, deleteMany } =
  createApi(schema, authOptions)
