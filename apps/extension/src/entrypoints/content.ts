import { logger } from "@init/observability/logger"
import { defineContentScript } from "#imports"

export default defineContentScript({
  main() {
    logger.info("Hello content.")
  },
  matches: ["*://*.google.com/*"],
})
