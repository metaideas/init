import type { PlopTypes } from "@turbo/gen"
import { getAppChoices } from "../../shared/utils"
import { convexMobileAdapter } from "./convex"
import { honoAdapter } from "./hono"
import { trpcAdapter } from "./trpc"
import {
  backendNames,
  type BackendAdapter,
  type BackendName,
  type ConnectBackendAnswers,
  type SupportedApp,
} from "./types"

const adapterMap = {
  "app:hono": honoAdapter,
  "app:trpc": trpcAdapter,
  "desktop:hono": honoAdapter,
  "desktop:trpc": trpcAdapter,
  "mobile:convex": convexMobileAdapter,
  "mobile:hono": honoAdapter,
} satisfies Partial<Record<`${SupportedApp}:${BackendName}`, BackendAdapter>>

function checkHasBypassArguments(): boolean {
  if (process.argv.some((argument) => argument === "--args" || argument.startsWith("--args="))) {
    return true
  }

  const jsonIndex = process.argv.indexOf("--json")
  const payload = process.argv[jsonIndex + 1]
  if (jsonIndex === -1 || !payload) return false

  try {
    const parsedPayload = JSON.parse(payload) as { args?: unknown[] }
    return Array.isArray(parsedPayload.args) && parsedPayload.args.length > 0
  } catch {
    return false
  }
}

const hasBypassArguments = checkHasBypassArguments()

function getAdapter(app: string, backend: string): BackendAdapter | undefined {
  return adapterMap[`${app}:${backend}` as keyof typeof adapterMap]
}

export function registerConnectBackendGenerator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("connect-backend", {
    actions: (rawAnswers) => {
      const answers = rawAnswers as ConnectBackendAnswers
      if (answers.backend === "convex") Object.assign(answers, { auth: true })

      const adapter = getAdapter(answers.app, answers.backend)
      if (!adapter) {
        throw new Error(
          `Unsupported backend connection: ${answers.app} + ${answers.backend}. Supported combinations: ${Object.keys(
            adapterMap
          ).join(", ")}.`
        )
      }

      return [
        async () => {
          await adapter.preflight(answers)
          return `Preflight passed for apps/${answers.app} + ${answers.backend}`
        },
        ...adapter.getActions(answers),
      ]
    },
    description: "Connect an app to a maintained backend adapter",
    prompts: [
      {
        choices: getAppChoices(),
        message: "Which app would you like to connect?",
        name: "app",
        type: "list",
      },
      {
        choices: [...backendNames],
        message: "Which backend would you like to connect?",
        name: "backend",
        type: "list",
        validate: (backend: string, answers: ConnectBackendAnswers) =>
          getAdapter(answers.app, backend) !== undefined ||
          `${answers.app} does not support the ${backend} backend`,
      },
      {
        default: false,
        message: "Include auth client wiring?",
        name: "auth",
        type: "confirm",
        when: hasBypassArguments
          ? undefined
          : (answers: ConnectBackendAnswers) =>
              answers.backend !== "convex" && answers.app !== "desktop",
      },
      {
        default: false,
        message: "Would you like an example showing how to use this backend?",
        name: "example",
        type: "confirm",
      },
    ],
  })
}
