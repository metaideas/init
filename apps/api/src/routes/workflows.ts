import { inngest } from "@init/workflows/client"
import { serve } from "@init/workflows/serve"
import { demoFunction } from "#features/demo/functions.ts"
import { factory } from "#shared/utils.ts"

export default factory.createApp().on(
  ["GET", "PUT", "POST"],
  "/",
  serve({
    client: inngest,
    functions: [demoFunction],
  })
)
