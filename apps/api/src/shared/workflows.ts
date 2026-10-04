import { Workflows } from "@v1/workflows/client"
import { ENV } from "#shared/env.generated.ts"
import { log } from "#shared/logger.ts"

export const workflows = new Workflows({
  logger: log,
  poolSize: 5,
  queues: { default: { concurrency: 10 } },
  url: ENV.DATABASE_URL,
})
