import { logger } from "@init/observability/logger"
import { defineProxyService } from "@webext-core/proxy-service"

class TestService {
  // oxlint-disable-next-line class-methods-use-this - Example of a method
  async test() {
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve()
      }, 1000)
    })
    logger.info`Using the TestService`
  }
}

export const [registerTestService, getTestService] = defineProxyService(
  "TestService",
  () => new TestService()
)
