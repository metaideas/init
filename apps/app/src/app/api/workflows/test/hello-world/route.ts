import { logger } from "@init/observability/logger"
import { serve } from "@init/queue/workflows/nextjs"

export const { POST } = serve(async context => {
  const result = await context.run(
    "hello-world",
    () => "This was done in a step"
  )

  logger.info({ date: new Date() }, "Hello world!")

  await context.sleep("sleep-1", 5)

  logger.info({ date: new Date() }, result)
})
