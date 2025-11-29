import { extend } from "@init/error"
import { TRPCError } from "@trpc/server"
import { getContext } from "hono/context-storage"
import { createFactory } from "hono/factory"
import { HTTPException } from "hono/http-exception"
import type { AppContext } from "#shared/types.ts"

/**
 * A utility function to create Hono apps and middlewares with the correct
 * context type.
 */
export const factory = createFactory<AppContext>()

/**
 * A utility function to get the context from the request.
 */
export const context = getContext<AppContext>

// Extended error classes with Fault functionality
export const HTTPFault = extend(HTTPException)
export const TRPCFault = extend(TRPCError)
