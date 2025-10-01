import { createServerFn } from "@tanstack/react-start"
import {
  requireAdmin,
  requireSession,
  withDatabase,
  withLogger,
} from "~/shared/server/middleware"

export const publicFunction = createServerFn().middleware([
  withDatabase,
  withLogger,
])
export const protectedFunction = publicFunction.middleware([requireSession])
export const adminFunction = protectedFunction.middleware([requireAdmin])
