import { defineSchema } from "convex/server"
import { tables } from "./schema.generated.ts"

export default defineSchema({ ...tables })
