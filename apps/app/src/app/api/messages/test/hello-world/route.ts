import { logger } from "@init/observability/logger"
import { verifyMessageRequest } from "@init/queue/messages/verify"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  const result = await verifyMessageRequest(request, "test/hello-world")

  if (!result.success) {
    return result.error
  }

  logger.info(
    {
      message: result.body.message,
    },
    "Hello world!"
  )

  return new Response(`Hello world! ${result.body.message}`)
}
