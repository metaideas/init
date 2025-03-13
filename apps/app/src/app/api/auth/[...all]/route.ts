import { handler } from "@this/auth/nextjs"

import { auth } from "~/shared/auth/server"

export const { POST, GET } = handler(auth)
