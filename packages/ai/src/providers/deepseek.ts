import { createDeepSeek } from "@ai-sdk/deepseek"
import env from "@this/env/ai.server"

export const deepseek = createDeepSeek({
  apiKey: env.DEEPSEEK_API_KEY,
})
