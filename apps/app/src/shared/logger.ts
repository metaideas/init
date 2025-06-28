import { createLogger } from "@init/observability/logger"
import env from "~/shared/env"

export const logger = createLogger({
  axiom: {
    dataset: env.NEXT_PUBLIC_AXIOM_DATASET,
    token: env.NEXT_PUBLIC_AXIOM_TOKEN,
  },
})
