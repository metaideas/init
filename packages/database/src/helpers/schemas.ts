import * as z from "@v1/utils/schema"
import { createSchemaFactory } from "drizzle-zod"

export const { createSelectSchema, createInsertSchema, createUpdateSchema } = createSchemaFactory({
  zodInstance: z,
})
