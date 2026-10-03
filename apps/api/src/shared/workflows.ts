import { pool } from "@init/database/client"
import { Workflows } from "@init/workflows/client"

export const workflows = new Workflows({
  pool,
  queues: { default: { concurrency: 10 } },
})
