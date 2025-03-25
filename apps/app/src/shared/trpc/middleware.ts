import { ipAddress } from "@vercel/functions"
import { headers } from "next/headers"

import { createRateLimiter } from "@init/security/ratelimit"

import { TRPCError } from "@trpc/server"
import { middleware } from "~/shared/trpc/server"

export function withRateLimitByIp(
  prefix: string,
  limiter: Parameters<typeof createRateLimiter>[1]["limiter"]
) {
  const rateLimiter = createRateLimiter(prefix, { limiter })

  return middleware(async ({ next, ctx }) => {
    const ip = await ipAddress({ headers: await headers() })

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
