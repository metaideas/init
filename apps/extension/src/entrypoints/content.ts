import { logger } from "@init/observability/logger"
import { defineContentScript } from "wxt/utils/define-content-script"

export default defineContentScript({
  main() {
    logger.info("Hello content.")
  },
  matches: ["*://*.google.com/*"],
})
