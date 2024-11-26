import { auth } from "@this/auth"
import { handler } from "@this/auth/nextjs"

export const { POST, GET } = handler(auth)
