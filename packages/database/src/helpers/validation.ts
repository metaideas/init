import * as z from "@init/utils/schema"
import { createSchemaFactory } from "drizzle-zod"

export const { createSelectSchema, createInsertSchema, createUpdateSchema } = createSchemaFactory({
  zodInstance: z,
})
