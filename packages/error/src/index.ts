import type { AuthenticationError } from "./auth"

declare module "faultier" {
  interface FaultRegistry extends AuthenticationError {
    TEST_ERROR: { timestamp: number }
  }
}

export { Fault } from "faultier"
export { extend } from "faultier/extend"
