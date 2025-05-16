import "dotenv/config"
import "~/instrument"

import { serve } from "@hono/node-server"

import { logger, styles } from "@init/observability/logger"

import app from "~/app"
import env from "~/shared/env"

const start = performance.now()

const server = serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  info => {
    const duration = performance.now() - start

    logger.info(
      `⚡ Server started in ${styles.yellow(`${duration.toFixed(2)}ms`)}`
    )
    logger.info(
      `🔌 Server running at ${styles.green(`http://localhost:${info.port}/`)}`
    )
  }
)

// Graceful shutdown
process.on("SIGINT", () => {
  server.close()
  process.exit(0)
})

process.on("SIGTERM", () => {
  server.close(err => {
    if (err) {
      logger.error(err)
      process.exit(1)
    }

    process.exit(0)
  })
})
