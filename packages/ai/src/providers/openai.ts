import { createOpenAI } from "@ai-sdk/openai"
import env from "@this/env/openai"

export const openai = createOpenAI({
  apiKey: env.OPENAI_API_KEY,
  compatibility: "strict",
})
