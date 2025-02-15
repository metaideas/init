import { anthropic } from "@ai-sdk/anthropic"
import { deepseek } from "@ai-sdk/deepseek"
import { google } from "@ai-sdk/google"
import { openai } from "@ai-sdk/openai"
import { experimental_createProviderRegistry as createProviderRegistry } from "ai"

export const registry = createProviderRegistry({
  anthropic,
  openai,
  deepseek,
  google,
})

export { createAnthropic, anthropic } from "@ai-sdk/anthropic"
export { createOpenAI, openai } from "@ai-sdk/openai"
export { createDeepSeek, deepseek } from "@ai-sdk/deepseek"
export { createGoogleGenerativeAI, google } from "@ai-sdk/google"
