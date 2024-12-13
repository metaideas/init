import { createAnthropic } from "@ai-sdk/anthropic"
import env from "@this/env/anthropic"

export const anthropic = createAnthropic({
  apiKey: env.ANTHROPIC_API_KEY,
})
