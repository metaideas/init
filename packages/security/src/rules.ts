import type { Primitive, Product } from "arcjet"

export type { ArcjetDecision as Decision } from "arcjet"
export {
  botCategories,
  detectBot,
  filter,
  fixedWindow,
  protectSignup,
  sensitiveInfo,
  slidingWindow,
  tokenBucket,
  validateEmail,
} from "arcjet"

export type SecurityRule = Primitive | Product
