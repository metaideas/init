import { logger } from "@init/observability/logger"
import { browser } from "wxt/browser"
import { defineBackground } from "#imports"
import { registerTestService } from "#shared/services.ts"

export default defineBackground(() => {
  logger.info({ id: browser.runtime.id }, "Hello from the background script!")

  registerTestService()
})
