import { createServerFn } from "@tanstack/react-start"
import { requireAdmin, requireSession, withLogger } from "#shared/server/middleware.ts"

export const publicFunction = createServerFn().middleware([withLogger])
export const protectedFunction = publicFunction.middleware([requireSession])
export const adminFunction = protectedFunction.middleware([requireAdmin])
