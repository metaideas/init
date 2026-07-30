import type { PlopTypes } from "@turbo/gen"

export const backendNames = ["convex", "hono", "trpc"] as const
export type BackendName = (typeof backendNames)[number]
export type SupportedApp = "app" | "desktop" | "mobile"

export type ConnectBackendAnswers = PlopTypes.Answers & {
  app: SupportedApp
  auth: boolean
  backend: BackendName
  example: boolean
  apiPackage?: string
  authPackage?: string
  backendPackage?: string
  envPackage?: string
  nativeUiPackage?: string
  uiPackage?: string
  utilsPackage?: string
  _hasPlannedChanges?: boolean
  _workspaceDependenciesChanged?: boolean
}

export type BackendAdapter = {
  getActions: (answers: ConnectBackendAnswers) => PlopTypes.ActionType[]
  preflight: (answers: ConnectBackendAnswers) => Promise<void>
}
