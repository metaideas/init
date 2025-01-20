import { defineProxyService } from "@webext-core/proxy-service"

class TestService {
  async test() {
    console.log("Using the TestService")
  }
}

export const [registerTestService, getTestService] = defineProxyService(
  "TestService",
  () => new TestService()
)
