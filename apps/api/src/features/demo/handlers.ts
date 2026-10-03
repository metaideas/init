import { log } from "@init/observability/logger"
import { workflows } from "#shared/workflows.ts"

export const greetUser = workflows.define("greetUser", async ({ userId }: { userId: string }) => {
  const greeting = await workflows.step("composeGreeting", () => `Hello, ${userId}`)

  await workflows.sleep(1000)

  await workflows.step("deliverGreeting", () => {
    log.info({ message: greeting, scope: "workflows", userId })
  })

  return { greeting }
})
