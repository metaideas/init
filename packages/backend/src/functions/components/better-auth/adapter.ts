import { createApi } from "@convex-dev/better-auth"
import { createAuthOptions } from "#functions/shared/auth.ts"
import schema from "./schema"

const api = createApi(schema, createAuthOptions)

export const { create, findOne, findMany } = api
export const { updateOne, updateMany, deleteOne, deleteMany } = api
