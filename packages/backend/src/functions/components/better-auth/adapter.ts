import { createApi } from "@convex-dev/better-auth"
import { createAuthOptions } from "#functions/shared/auth.ts"
import schema from "./schema"

export const { create, findOne, findMany, updateOne, updateMany, deleteOne, deleteMany } =
  createApi(schema, createAuthOptions)
