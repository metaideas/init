import { Workflows } from "@init/workflows/client"
import { ENV } from "#shared/env.generated.ts"

export const workflows = new Workflows({
  poolSize: 5,
  queues: { default: { concurrency: 10 } },
  url: ENV.DATABASE_URL,
})
