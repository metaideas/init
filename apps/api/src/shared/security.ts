import { secure } from "@init/security"

export const security = secure()

export type Security = typeof security
