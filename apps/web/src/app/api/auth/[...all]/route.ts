import { handler } from "@this/auth/nextjs"
import { auth } from "@this/auth/server"

export const { POST, GET } = handler(auth)
