import { browser } from "wxt/browser"
import { defineBackground } from "wxt/utils/define-background"
import { logger } from "#shared/logger.ts"

export default defineBackground({
  main: () => {
    logger.info({ id: browser.runtime.id, message: "Hello from the background script!" })
  },
  type: "module",
})
