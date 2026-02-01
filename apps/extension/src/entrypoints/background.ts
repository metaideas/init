import { browser } from "wxt/browser"
import { defineBackground } from "wxt/utils/define-background"
import { logger } from "#shared/logger.ts"

export default defineBackground({
  main: () => {
    logger.with({ id: browser.runtime.id }).info`Hello from the background script!`
  },
  type: "module",
})
