import { logger } from "@init/observability/logger"
import { defineProxyService } from "@webext-core/proxy-service"

class TestService {
  async test() {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    logger.info("Using the TestService")
  }
}

export const [registerTestService, getTestService] = defineProxyService(
  "TestService",
  () => new TestService()
)
