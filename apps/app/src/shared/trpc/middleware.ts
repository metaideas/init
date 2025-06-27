import { createRateLimiter } from "@init/security/ratelimit"
import { TRPCError } from "@trpc/server"
import { ipAddress } from "@vercel/functions"
import { headers } from "next/headers"
import { middleware } from "~/shared/trpc/server"

export function withRateLimitByIp(
  prefix: string,
  limiter: Parameters<typeof createRateLimiter>[1]["limiter"]
) {
  let rateLimiter: ReturnType<typeof createRateLimiter>

  return middleware(async ({ next, ctx }) => {
    const ip = await ipAddress({ headers: await headers() })

    if (!rateLimiter) {
      rateLimiter = createRateLimiter(prefix, {
        limiter,
        redis: ctx.kv,
      })
    }

    const limit = await rateLimiter.limit(ip ?? "Unknown")

    if (!limit.success) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Rate limit exceeded",
        cause: limit.reason,
      })
    }

    return next({ ctx })
  })
}
