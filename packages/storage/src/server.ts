import type { Router } from "@better-upload/server"

export function createStorage(options: Router) {
  return options
}

export { handleRequest, route } from "@better-upload/server"
export * from "@better-upload/server/clients"
export * from "@better-upload/server/helpers"
