import { createServerFn } from "@tanstack/react-start"
import { withDatabase, withLogger } from "#shared/server/middleware.ts"

export const publicFunction = createServerFn().middleware([withLogger, withDatabase])
