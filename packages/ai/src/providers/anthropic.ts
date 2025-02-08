import { createAnthropic } from "@ai-sdk/anthropic"

import env from "@this/env/ai.server"

export const anthropic = createAnthropic({
  apiKey: env.ANTHROPIC_API_KEY,
})
